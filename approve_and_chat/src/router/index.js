// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import RegisterRequest from '../views/RegisterRequest.vue'
import Chat from '../views/Chat.vue';

const routes = [
   {
    path: '/',
    redirect: '/approve'
  }, {
    path: '/approve',
    name: 'RegisterRequest',
    component: RegisterRequest
  }, {
    path: '/communicate',
    name: 'Chat',
    component: Chat
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
