import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ServerListView from '@/views/Servers/ServerListView.vue'
import ConsoleView from '@/views/Servers/ConsoleView.vue'
import FileView from '@/views/Servers/FileView.vue'
import TestView from '@/views/TestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
      meta: {
        title: '仪表盘',
        breadcrumb: '首页'
      }
    },
    {
      path: '/servers',
      name: 'Servers',
      // component: ServerListView, // 设置空路由组件，主路由就不需要设置了
      meta: {
        title: '服务器列表',
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
          path: ':uuid/console',
          name: 'Console',
          component: ConsoleView,
          meta: {
            title: '控制台',
            breadcrumb: '控制台',
            // breadcrumb: (route) => `控制台 - ${route.params.uuid}`,
            parent: 'Servers'
          },
        },
        {
          path: ':uuid/files',
          name: 'Files',
          component: FileView,
          meta: {
            title: '文件管理',
            breadcrumb: '文件管理',
            // breadcrumb: (route) => `文件管理 - ${route.params.uuid}`,
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
  ],
  // 页面滚动位置判断
  scrollBehavior(to, from, savedPosition) {
    // 如果有 savedPosition（比如浏览器的前进/后退），就恢复到之前的位置
    if (savedPosition) {
      return savedPosition
    }
    // 否则滚动到顶部
    return { top: 0 }
  },

})

// 设置名称
router.beforeEach(to => {
  document.title = 'NGSP - ' + (to.meta.title ?? to.name);
});

export default router
