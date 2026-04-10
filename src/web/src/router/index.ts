import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ServerListView from '@/views/Servers/ServerListView.vue'
import ConsoleView from '@/views/Servers/ConsoleView.vue'
import FileView from '@/views/Servers/FileView.vue'
import TestView from '@/views/TestView.vue'
import Auth from '@/components/Auth.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Auth,
      meta: {
        title: '登录',
        breadcrumbSkip: true, // 登录页不加入面包屑导航
      },
    },
    {
      path: '/register',
      name: 'Register',
      component: Auth,
      meta: {
        title: '注册',
        breadcrumbSkip: true, // 注册页不加入面包屑导航
      },
    },
    {
      path: '/',
      name: 'Home',
      component: HomeView,
      meta: {
        title: '仪表盘',
        breadcrumb: '首页',
        requiresAuth: true
      }
    },
    {
      path: '/servers',
      name: 'Servers',
      // component: ServerListView, // 设置空路由组件，主路由就不需要设置了
      meta: {
        title: '服务器列表',
        breadcrumb: '服务器列表',
        parent: 'Home',
        requiresAuth: true
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
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.meta.requiresAuth
  // 需要登录但无 token → 重定向到登录页
  if (requiresAuth && !token) {
    return '/login'
  }

  // 已登录访问登录页 → 重定向到首页
  if (to.path === '/login' && token) {
    return '/'
  }

  document.title = 'NGSP - ' + (to.meta.title ?? to.name)

  // 其他情况放行
  return true
})

export default router
