import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ServersView from '@/views/ServersView.vue'
import ConsoleView from '@/views/ConsoleView.vue'
import TestView from '@/views/TestView.vue'
import ServerListView from '@/views/ServerListView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { breadcrumb: '首页' }
  },
  {
    path: '/servers',
    name: 'Servers',
    component: ServersView,
    meta: {
      breadcrumb: '服务器列表',
      parent: 'Home'
    },
    children: [
       {
        path: '',
        name: 'ServerList',
        component: ServerListView,
        meta: {
          breadcrumbSkip: true,
          parent: 'Servers'
        }
      },
      {
        path: ':id/console',
        name: 'Console',
        component: ConsoleView,
        meta: {
          breadcrumb: (route) => `控制台 - ${route.params.id}`,
          parent: 'Servers'
        },
      },
      {
        path: ':id/files',
        name: 'Files',
        component: TestView,
        meta: {
          breadcrumb: (route) => `文件管理 - ${route.params.id}`,
          parent: 'Servers'
        },
      },
    ],
  },
  {
    path: '/test',
    name: 'Test',
    component: TestView,
    meta: {
      breadcrumb: '测试页面',
      parent: 'Home'
    }
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})