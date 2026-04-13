import { createRouter, createWebHistory } from 'vue-router'
// 主要路由组件
import HomeView from '@/views/HomeView.vue'
// 服务器列表组件
import ServerListView from '@/views/Servers/ServerListView.vue'
// 控制台组件
import ConsoleView from '@/views/Servers/ConsoleView.vue'
// 文件管理
import FileView from '@/views/Servers/FileView.vue'
// 测试组件
import TestView from '@/views/TestView.vue'
// 登录组件
import Auth from '@/components/Auth.vue'
// 管理后台组件
import AdminView from '@/views/AdminView.vue'
// 管理后台用户列表组件
import UsersView from '@/views/Admin/UsersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: '/admin',
      name: 'Admin',
      component: AdminView,
      meta: {
        title: '管理后台',
        breadcrumb: '管理后台',
        requiresAuth: true,
      },
    },
    {
      path: '/admin/users',
      name: 'AdminUsersView',
      component: UsersView,
      meta: {
        title: '用户管理',
        breadcrumb: '用户管理',
        parent: 'Admin'
      }
    },
    {
      path: '/test',
      name: 'Test',
      component: TestView,
      meta: {
        breadcrumb: '测试页面',
        requiresAuth: false
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

router.beforeEach(async(to, from) => {
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

  // 设置页面标题
  document.title = 'NGSP - ' + (to.meta.title ?? to.name)

  // 其他情况放行
  return true
})

export default router
