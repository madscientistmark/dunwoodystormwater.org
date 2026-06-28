import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import PetitionPage from './pages/PetitionPage.vue'
import StoryPage from './pages/StoryPage.vue'
import AboutPage from './pages/AboutPage.vue'
import FaqPage from './pages/FaqPage.vue'
import ContactPage from './pages/ContactPage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/petition', name: 'petition', component: PetitionPage },
  { path: '/share-your-story', name: 'story', component: StoryPage },
  { path: '/about', name: 'about', component: AboutPage },
  { path: '/faq', name: 'faq', component: FaqPage },
  { path: '/contact', name: 'contact', component: ContactPage },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
