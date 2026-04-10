<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, type RouteRecordNormalized } from 'vue-router'
import type { RouterMetaType } from '@/types/RouterMetaType'

// 扩展路由元信息类型，支持自定义属性
declare module 'vue-router' {
  interface RouteMeta extends RouterMetaType {}
}

// 定义面包屑项的类型
interface BreadcrumbItem {
    title: string
    path: string
}

const route = useRoute()
const router = useRouter()

/**
 * 通过路由名称获取路由记录对象
 * @param name - 路由名称（支持 string 或 symbol）
 * @returns 路由记录对象或 undefined
 */
const getRouteByName = (name: string | symbol | undefined | null): RouteRecordNormalized | undefined => {
    if (name == null) return undefined
    // router.getRoutes() 返回的是 RouteRecordNormalized 数组
    return router.getRoutes().find(r => r.name === name)
}

/**
 * 递归构建面包屑数组
 * @param routeRecord - 当前路由记录
 * @param crumbs - 累积的面包屑数组（用于递归传递）
 * @returns 面包屑数组（从最顶层到当前路由）
 */
const buildBreadcrumbs = (routeRecord: RouteRecordNormalized | undefined, crumbs: BreadcrumbItem[] = []): BreadcrumbItem[] => {
    if (!routeRecord) return crumbs

    // 如果该路由需要跳过（breadcrumbSkip = true），则不加入面包屑，但继续处理父级
    if (routeRecord.meta?.breadcrumbSkip) {
        const parentName = routeRecord.meta?.parent
        if (parentName) {
            const parentRecord = getRouteByName(parentName)
            return buildBreadcrumbs(parentRecord, crumbs)
        }
        return crumbs
    }

    // 解析标题（支持静态字符串或动态函数）
    let title: string
    const metaBreadcrumb = routeRecord.meta?.breadcrumb

    if (typeof metaBreadcrumb === 'function') {
        title = metaBreadcrumb(route)
    } else if (typeof metaBreadcrumb === 'string') {
        title = metaBreadcrumb
    } else if (routeRecord.name) {
        // 如果 name 是 symbol，转为字符串（Symbol 的描述或默认值）
        title = routeRecord.name.toString()
    } else {
        title = routeRecord.path
    }

    // 将当前项插入到数组开头（保证顺序从顶层到当前）
    crumbs.unshift({
        title,
        path: routeRecord.path
    })

    // 处理父级路由
    const parentName = routeRecord.meta?.parent
    if (parentName) {
        const parentRecord = getRouteByName(parentName)
        if (parentRecord) {
            return buildBreadcrumbs(parentRecord, crumbs)
        }
    }

    return crumbs
}

// 生成面包屑数组（响应式）
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    // 关键：通过当前路由的 name 获取路由记录对象
    const currentRecord = getRouteByName(route.name)
    // 构建面包屑
    let crumbs = buildBreadcrumbs(currentRecord)
    return crumbs
})
</script>

<template>
    <div class="breadcrumbs text-sm">
        <ul>
            <li v-for="(crumb, index) in breadcrumbs" :key="index">
                <router-link v-if="index !== breadcrumbs.length - 1" :to="crumb.path">
                    {{ crumb.title }}
                </router-link>
                <span v-else>{{ crumb.title }}</span>
            </li>
        </ul>
    </div>
</template>