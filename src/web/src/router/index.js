import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ConsoleView from '../views/ConsoleView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/console/:id', component: ConsoleView }
  ]
})