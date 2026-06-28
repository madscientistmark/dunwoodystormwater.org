<script setup>
import { onMounted, computed } from 'vue'
import { useSigners } from '../composables/useSigners.js'

const { signers, status, load } = useSigners()
onMounted(load)

const total = computed(() => signers.value.length)

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return iso
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function printPage() {
  window.print()
}
</script>

<template>
  <section class="roster">
    <div class="container">
      <header class="roster__head">
        <h1>Petition Signatories</h1>
        <p class="roster__sub">
          Citizens' Petition for Transparent and Consistent Stormwater Management
        </p>
        <p v-if="status === 'ready'" class="roster__count">
          {{ total.toLocaleString('en-US') }} signatures
        </p>
        <button class="roster__print no-print" @click="printPage">Print this list</button>
      </header>

      <p v-if="status === 'loading'" class="roster__msg">Loading signatories…</p>
      <p v-else-if="status === 'unauthorized'" class="roster__msg">
        Access denied. This page requires a valid key.
      </p>
      <p v-else-if="status === 'error'" class="roster__msg">
        Unable to load signatories. Please try again.
      </p>
      <p v-else-if="status === 'ready' && total === 0" class="roster__msg">
        No signatures yet.
      </p>

      <table v-else-if="status === 'ready'" class="roster__table">
        <thead>
          <tr>
            <th class="col-num">#</th>
            <th>Name</th>
            <th>Address / Neighborhood</th>
            <th>Dunwoody Resident</th>
            <th>Date Signed</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in signers" :key="i">
            <td class="col-num">{{ i + 1 }}</td>
            <td>{{ s.name }}</td>
            <td>{{ s.address }}</td>
            <td>{{ s.residency }}</td>
            <td>{{ fmtDate(s.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.roster { padding: 2rem 0 4rem; }
.roster__head { margin-bottom: 1.5rem; }
.roster__head h1 { color: var(--color-primary-dark); margin: 0 0 0.25rem; }
.roster__sub { color: var(--color-muted); margin: 0 0 0.5rem; }
.roster__count { font-weight: 700; font-size: 1.1rem; margin: 0 0 1rem; }
.roster__print {
  background: var(--color-primary); color: #fff; border: 0; border-radius: var(--radius);
  padding: 0.6rem 1.1rem; font-weight: 700; cursor: pointer;
}
.roster__msg { color: var(--color-muted); font-size: 1.05rem; }

.roster__table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.roster__table th, .roster__table td {
  text-align: left; padding: 0.5rem 0.65rem; border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}
.roster__table thead th {
  border-bottom: 2px solid var(--color-primary); color: var(--color-primary-dark);
}
.roster__table tbody tr:nth-child(even) { background: var(--color-bg); }
.col-num { width: 3rem; color: var(--color-muted); text-align: right; }

/* ---- Print styles: clean roster, no chrome ---- */
@media print {
  .no-print { display: none !important; }
  .roster { padding: 0; }
  .roster__head h1 { font-size: 18pt; }
  .roster__table { font-size: 10pt; }
  .roster__table tbody tr:nth-child(even) { background: transparent; }
  .roster__table th, .roster__table td {
    border-bottom: 1px solid #999; padding: 4px 6px;
  }
  /* Avoid breaking a row across pages; repeat the header on each page. */
  .roster__table tr { page-break-inside: avoid; }
  thead { display: table-header-group; }
}
</style>
