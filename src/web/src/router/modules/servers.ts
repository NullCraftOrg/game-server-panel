// 服务器列表组件
import ServerListView from '@/views/Servers/ServerListView.vue'
// 控制台组件
import ConsoleView from '@/views/Servers/ConsoleView.vue'
// 文件管理
import FileView from '@/views/Servers/FileView.vue'

export default [
    {
        path: '/servers',
        name: 'Servers',
        component: ServerListView, // 设置空路由组件，主路由就不需要设置了
        meta: {
            title: '服务器列表',
            breadcrumb: '服务器列表',
            parent: 'Home',
            requiresAuth: true
        },
    },
    {
        path: '/servers/:uuid/console',
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
        path: '/servers/:uuid/files',
        name: 'Files',
        component: FileView,
        meta: {
            title: '文件管理',
            breadcrumb: '文件管理',
            // breadcrumb: (route) => `文件管理 - ${route.params.uuid}`,
            parent: 'Servers'
        },
    },
]