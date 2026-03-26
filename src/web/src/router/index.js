import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ConsoleView from '../views/ConsoleView.vue'
import TestView from '@/views/TestView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/console/:id', component: ConsoleView },
    { path: '/test', component: TestView }
  ]
})