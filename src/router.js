import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import PetitionPage from './pages/PetitionPage.vue'
import StoryPage from './pages/StoryPage.vue'
import AboutPage from './pages/AboutPage.vue'
import FaqPage from './pages/FaqPage.vue'
import ContactPage from './pages/ContactPage.vue'
import RosterPage from './pages/RosterPage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/petition', name: 'petition', component: PetitionPage },
  { path: '/share-your-story', name: 'story', component: StoryPage },
  { path: '/about', name: 'about', component: AboutPage },
  { path: '/faq', name: 'faq', component: FaqPage },
  { path: '/contact', name: 'contact', component: ContactPage },
  // Hidden, unlinked roster of signatories. Not in nav; marked noindex.
  { path: '/roster-x7k2', name: 'roster', component: RosterPage, meta: { noindex: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Add/remove a robots noindex meta tag based on the route's meta.noindex flag.
router.afterEach((to) => {
  const id = 'route-robots-meta'
  let tag = document.getElementById(id)
  if (to.meta && to.meta.noindex) {
    if (!tag) {
      tag = document.createElement('meta')
      tag.id = id
      tag.name = 'robots'
      document.head.appendChild(tag)
    }
    tag.content = 'noindex, nofollow'
  } else if (tag) {
    tag.remove()
  }
})

export default router
