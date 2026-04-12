<script setup lang="ts">
import Header from '@/components/Header.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
    <div class="flex flex-col min-h-screen bg-base-200">
        <Header />

        <main class="flex-1 container mx-auto p-3 my-3">
            
            <div id="global-container-alert"></div>

            <Breadcrumbs />
            <router-view />
        </main>

        <Footer />
    </div>
</template>
