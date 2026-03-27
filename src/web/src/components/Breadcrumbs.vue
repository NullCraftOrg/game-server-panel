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

// 生成面包屑数组
const breadcrumbs = computed(() => {
  // 获取当前匹配的路由记录（包括嵌套路由）
  const matched = route.matched
  const crumbs = []

  for (const record of matched) {
    // 跳过没有定义面包屑的路由（可选）
    if (!record.meta.breadcrumb) continue

    // 解析标题：支持函数或字符串
    let title = record.meta.breadcrumb
    if (typeof title === 'function') {
      title = title(route) // 传入当前路由对象
    }

    // 构建跳转路径（完整路径，如 '/products/123'）
    const path = router.resolve(record.path).fullPath

    crumbs.push({ title, path })
  }

  return crumbs
})
</script>