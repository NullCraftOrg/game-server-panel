<template>
    <div class="p-8 text-center">
        <!-- 打开对话框的按钮 -->
        <button class="btn btn-primary" @click="openDialog">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 12h14m-7-7v14" />
            </svg>
            新建服务器
        </button>

        <!-- 使用封装好的对话框组件 -->
        <AddServerDialog v-model:visible="dialogVisible" @confirm="handleConfirm" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '@/api'
import AddServerDialog from './dialogs/AddServerDialog.vue'

const dialogVisible = ref(false)

const openDialog = () => {
    dialogVisible.value = true
}

const handleConfirm = (data) => {
    create(data.name, data.fileName, data.command, data.cwd)
}

async function create(name, fileName, command, cwd) {
    await api.createServer({
        name,
        fileName,
        command,
        cwd: cwd || '.'
    })

    console.log('成功创建服务器。')

    location.reload()
}
</script>