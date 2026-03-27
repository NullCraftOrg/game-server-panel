<script setup>
import Header from '@/components/Header.vue';
import Breadcrumbs from './components/Breadcrumbs.vue';

</script>

<template>
  <Header />
  
  <div class="w-full px-10 mt-2">
    <Breadcrumbs />
    <router-view />
  </div>

</template>