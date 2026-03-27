import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ConsoleView from '../views/ConsoleView.vue'
import TestView from '@/views/TestView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { breadcrumb: '首页' },
    },
    {
      path: '/console/:id',
      name: 'Console',
      component: ConsoleView,
      meta: { breadcrumb: (route) => `控制台 - ${route.params.id}` }//breadcrumb: '控制台' }
    },
    { path: '/test', component: TestView }
  ]
})