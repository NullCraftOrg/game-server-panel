<script setup lang="ts">
import Header from '@/components/Header.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="flex flex-col h-screen bg-base-200">
    <Header />

    <!-- 使用 flex flex-col，让 main 成为纵向弹性容器 -->
    <main class="flex-1 container mx-auto p-3 my-3 flex flex-col">
      <div id="global-container-alert"></div>
      <Breadcrumbs />

      <router-view />
    </main>

    <Footer />
  </div>
</template>