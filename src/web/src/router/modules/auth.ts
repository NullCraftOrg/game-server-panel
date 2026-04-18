// 登录组件
import Auth from '@/components/Auth.vue'

export default [
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
]