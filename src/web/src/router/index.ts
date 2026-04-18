import { createRouter, createWebHistory } from 'vue-router'
// 主要路由组件
import HomeView from '@/views/HomeView.vue'
// 测试组件
import TestView from '@/views/TestView.vue'

// 引入路由
import AuthRouter from '@/router/modules/auth'
import ServersRouter from '@/router/modules/servers'
import AdminRouter from '@/router/modules/admin'

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
      path: '/test',
      name: 'Test',
      component: TestView,
      meta: {
        breadcrumb: '测试页面',
        requiresAuth: false
      }
    },
    ...AuthRouter,
    ...ServersRouter,
    ...AdminRouter,
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

router.beforeEach(async (to, from) => {
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
