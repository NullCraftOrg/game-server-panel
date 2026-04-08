import { useRoute } from 'vue-router'
export interface RouterMetaType {
    /** 面包屑显示文本，支持字符串或函数 */
    breadcrumb?: string | ((route: ReturnType<typeof useRoute>) => string)
    /** 是否跳过当前路由（不加入面包屑但继续向上查找） */
    breadcrumbSkip?: boolean
    /** 手动指定的父级路由名称 */
    parent?: string
}