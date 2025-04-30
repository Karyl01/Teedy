// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import RegisterRequest from '../views/RegisterRequest.vue'

const routes = [
   {
    path: '/',
    redirect: '/approve'
  },
  {
    path: '/approve',
    name: 'RegisterRequest',
    component: RegisterRequest
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
