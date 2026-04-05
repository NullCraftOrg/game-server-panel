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

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 通过路由名称获取路由记录对象（包含 meta, path 等）
const getRouteByName = (name) => {
  return router.getRoutes().find(r => r.name === name)
}

// 递归构建面包屑，从给定路由记录开始向上查找 parent 如果 breadcrumbSkip 则跳过当前项但继续向上查找
const buildBreadcrumbs = (routeRecord, crumbs = []) => {
  if (!routeRecord) return crumbs

  // 如果该路由需要跳过，则不加入 breadcrumb，但继续处理父级
  if (routeRecord.meta?.breadcrumbSkip) {
    const parentName = routeRecord.meta?.parent
    if (parentName) {
      const parentRecord = getRouteByName(parentName)
      return buildBreadcrumbs(parentRecord, crumbs)
    }
    return crumbs
  }

  // 正常处理：解析标题
  let title = routeRecord.meta?.breadcrumb
  if (typeof title === 'function') {
    title = title(route)
  }
  if (!title) {
    title = routeRecord.name || routeRecord.path
  }

  crumbs.unshift({
    title,
    path: routeRecord.path
  })

  // 处理父级
  const parentName = routeRecord.meta?.parent
  if (parentName) {
    const parentRecord = getRouteByName(parentName)
    if (parentRecord) {
      return buildBreadcrumbs(parentRecord, crumbs)
    }
  }

  return crumbs
}

// 生成面包屑数组
const breadcrumbs = computed(() => {
  // 关键：通过当前路由的 name 获取路由记录对象
  const currentRecord = getRouteByName(route.name)
  if (!currentRecord) {
    // 如果没有 name 或者未找到，可以尝试根据路径匹配，但推荐使用 name
    // console.warn('未找到当前路由记录，请检查路由是否定义了 name', route)
    return []
  }

  // 构建面包屑
  const crumbs = buildBreadcrumbs(currentRecord)

  // 可选：如果当前路由不是首页且没有包含首页，自动添加首页项（如果首页存在）
  const hasHome = crumbs.some(c => c.path === '/')
  if (!hasHome && route.path !== '/') {
    const homeRecord = getRouteByName('Home')
    if (homeRecord) {
      let homeTitle = homeRecord.meta?.breadcrumb
      if (typeof homeTitle === 'function') homeTitle = homeTitle(route)
      crumbs.unshift({
        title: homeTitle || '首页',
        path: '/'
      })
    }
  }

  return crumbs
})
</script>