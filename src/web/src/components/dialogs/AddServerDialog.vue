<template>
    <!-- 原生 dialog + daisyUI 模态框样式 -->
    <dialog ref="dialogRef" class="modal" @close="handleClose">
        <div class="modal-box">
            <h3 class="text-lg font-bold">新建服务器</h3>

            <!-- 表单区域 -->
            <div class="py-4 space-y-3">
                <!-- 服务器名称 -->
                <label class="form-control w-full">
                    <div class="label">
                        <span class="label-text">服务器名称</span>
                    </div>
                    <input type="text" v-model="serverData.name" placeholder="请输入服务器名称"
                        class="input input-bordered w-full" />
                </label>

                <!-- 运行文件 -->
                <label class="form-control w-full">
                    <div class="label">
                        <span class="label-text">运行文件</span>
                    </div>
                    <input type="text" v-model.number="serverData.fileName" placeholder="请输入要执行的文件完整路径"
                        class="input input-bordered w-full" />
                </label>

                <!-- 附加命令 -->
                <label class="form-control w-full">
                    <div class="label">
                        <span class="label-text">附加命令</span>
                    </div>
                    <input type="text" v-model.number="serverData.command" placeholder="请输入要附加的命令"
                        class="input input-bordered w-full" />
                </label>

                <!-- 运行目录 -->
                <label class="form-control w-full">
                    <div class="label">
                        <span class="label-text">运行目录</span>
                    </div>
                    <input type="text" v-model.number="serverData.cwd" placeholder="请输入服务器运行目录"
                        class="input input-bordered w-full" />
                </label>

                <!-- 简单校验提示 -->
                <p v-if="errorMsg" class="text-error text-sm mt-2">{{ errorMsg }}</p>
            </div>

            <!-- 操作按钮 -->
            <div class="modal-action">
                <button class="btn" @click="cancel">取消</button>
                <button class="btn btn-primary" @click="confirm">确认</button>
            </div>
        </div>

        <!-- 点击背景关闭（自动触发 close 事件） -->
        <form method="dialog" class="modal-backdrop">
            <button>关闭</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

// 控制对话框可见性的 prop
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

// 定义事件：confirm 传递表单数据，update:visible 用于 v-model
const emit = defineEmits(['confirm', 'update:visible'])

const dialogRef = ref(null)
const serverData = ref({
    name: '',
    fileName: '',
    command: '',
    cwd: '',
})
const errorMsg = ref('')

// 监听 visible 变化，打开或关闭对话框
watch(
    () => props.visible,
    async (newVal) => {
        if (newVal) {
            // 打开前重置表单和错误信息
            resetForm()
            await nextTick() // 确保 DOM 已更新
            dialogRef.value?.showModal()
        } else {
            dialogRef.value?.close()
        }
    },
    { immediate: true }
)

// 重置表单数据
const resetForm = () => {
    serverData.value = {
        name: '',
        fileName: '',
        command: '',
        cwd: '',
    }
    errorMsg.value = ''
}

// 关闭对话框，更新 visible 状态
const closeDialog = () => {
    emit('update:visible', false)
}

// 确认按钮逻辑
const confirm = () => {
    const { name, fileName, command, cwd } = serverData.value
    if (!name) {
        errorMsg.value = '请填写姓名'
        return
    }
    if (!fileName) {
        errorMsg.value = '请填写有效的运行文件'
        return
    }

    // 传递数据给父组件
    emit('confirm', { name, fileName, command, cwd })
    closeDialog()
}

// 取消按钮逻辑
const cancel = () => {
    closeDialog()
}

// 当对话框通过其他方式关闭（如点击背景、ESC 键）时，同步 visible 状态
const handleClose = () => {
    emit('update:visible', false)
}
</script>