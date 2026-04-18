// 管理后台组件
import AdminView from '@/views/AdminView.vue'
// 管理后台用户列表组件
import UsersView from '@/views/Admin/UsersView.vue'

export default [
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
]