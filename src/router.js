import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import AdminDashboard from './AdminDashboard.vue'

const routes = [
  {
    path: '/',
    component: App
  },
  {
    path: '/admin',
    component: AdminDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router