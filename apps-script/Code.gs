/**
 * Dunwoody Stormwater Stewardship — backend.
 * Bind this script to a Google Sheet (Extensions → Apps Script) and deploy as a Web App
 * (Execute as: Me; Who has access: Anyone). See README.md in this folder.
 */

var PETITION_SHEET = 'Petitions'
var STORY_SHEET = 'Stories'
var PHOTO_FOLDER_NAME = 'Dunwoody Stormwater Photos'

// Secret key guarding the signer-roster endpoint (?action=list&key=...).
// Change this to your own random string and keep it out of anything public-facing.
// It must match VITE_ROSTER_KEY in the frontend build.
var ROSTER_KEY = '0TiItGzmBGtA9UI9m_x6p-f_xrD4DvIl'

var PETITION_HEADERS = ['timestamp', 'name', 'email', 'address', 'residency', 'comments', 'updates_optin', 'affirmed', 'source']
var STORY_HEADERS = ['timestamp', 'name', 'email', 'neighborhood', 'issue_types', 'story', 'photo_url', 'source']

function doGet(e) {
  var params = (e && e.parameter) || {}
  if (params.action === 'count') {
    return json({ count: countPetitions() })
  }
  if (params.action === 'list') {
    if (params.key !== ROSTER_KEY) return json({ ok: false, error: 'Unauthorized.' })
    return json({ ok: true, signers: listSigners() })
  }
  return json({ ok: true, message: 'Dunwoody Stormwater API' })
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents)

    // Spam check: honeypot must be empty. Bots fill hidden fields; humans can't see it.
    if (body.hp) return json({ ok: true }) // silently drop

    if (body.type === 'petition') return handlePetition(body)
    if (body.type === 'story') return handleStory(body)
    return json({ ok: false, error: 'Unknown submission type.' })
  } catch (err) {
    return json({ ok: false, error: 'Server error: ' + err.message })
  }
}

function handlePetition(body) {
  if (!str(body.name)) return json({ ok: false, error: 'Name is required.' })
  if (!isEmail(body.email)) return json({ ok: false, error: 'A valid email is required.' })
  if (!str(body.residency)) return json({ ok: false, error: 'Residency is required.' })
  if (!body.affirmed) return json({ ok: false, error: 'You must affirm the statements.' })

  var sheet = getSheet(PETITION_SHEET, PETITION_HEADERS)
  sheet.appendRow([
    new Date(), str(body.name), str(body.email), str(body.address),
    str(body.residency), str(body.comments),
    body.updates_optin ? 'Yes' : 'No', body.affirmed ? 'Yes' : 'No', 'petition',
  ])
  return json({ ok: true })
}

function handleStory(body) {
  if (!str(body.name)) return json({ ok: false, error: 'Name is required.' })
  if (!isEmail(body.email)) return json({ ok: false, error: 'A valid email is required.' })
  if (!str(body.story)) return json({ ok: false, error: 'Your story is required.' })

  var photoUrl = ''
  if (body.photo && body.photo.dataBase64) {
    photoUrl = savePhoto(body.photo)
  }

  var issues = Array.isArray(body.issue_types) ? body.issue_types.join(', ') : ''
  var sheet = getSheet(STORY_SHEET, STORY_HEADERS)
  sheet.appendRow([
    new Date(), str(body.name), str(body.email), str(body.neighborhood),
    issues, str(body.story), photoUrl, 'story',
  ])
  return json({ ok: true })
}

function savePhoto(photo) {
  var bytes = Utilities.base64Decode(photo.dataBase64)
  var blob = Utilities.newBlob(bytes, photo.mimeType || 'image/jpeg', photo.name || 'photo')
  var folder = getPhotoFolder()
  var file = folder.createFile(blob)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
  return file.getUrl()
}

function getPhotoFolder() {
  var it = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME)
  return it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER_NAME)
}

function countPetitions() {
  var sheet = getSheet(PETITION_SHEET, PETITION_HEADERS)
  return Math.max(0, sheet.getLastRow() - 1) // minus header row
}

// Returns the roster of signers. Email is intentionally excluded (minimize PII).
function listSigners() {
  var sheet = getSheet(PETITION_SHEET, PETITION_HEADERS)
  var lastRow = sheet.getLastRow()
  if (lastRow < 2) return []
  // Columns (1-indexed): 1 timestamp, 2 name, 4 address, 5 residency.
  var values = sheet.getRange(2, 1, lastRow - 1, PETITION_HEADERS.length).getValues()
  return values.map(function (row) {
    var ts = row[0]
    return {
      name: str(row[1]),
      address: str(row[3]),
      residency: str(row[4]),
      timestamp: ts instanceof Date ? ts.toISOString() : str(ts),
    }
  })
}

function getSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(name)
  if (!sheet) {
    sheet = ss.insertSheet(name)
    sheet.appendRow(headers)
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers)
  }
  return sheet
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}

function str(v) { return v == null ? '' : String(v).trim() }
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(v)) }
