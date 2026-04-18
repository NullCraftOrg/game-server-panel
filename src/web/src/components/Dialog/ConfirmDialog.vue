<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    subTitle: {
        type: String,
        required: false,
    },
    buttonConfirmText: {
        type: String,
        default: '确认'
    },
    buttonConfirmColor: {
        type: String,
        default: 'btn-primary'
    },
    buttonCancelText: {
        type: String,
        default: '取消'
    },
    buttonCancelColor: {
        type: String,
    },
    // 控制对话框可见性
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['confirm', 'update:visible'])

const dialogRef = ref<HTMLDialogElement | null>(null)

const currentKey = ref<any | null>(null)

// 对外暴露 open 方法
const open = (key: any) => {
    currentKey.value = key
    dialogRef.value?.showModal()
}


// 监听 visible 变化，打开或关闭对话框
watch(
    () => props.visible,
    async (newVal) => {
        if (newVal) {
            dialogRef.value?.showModal()
        } else {
            dialogRef.value?.close()
        }
    },
    { immediate: true }
)

/**
 * 关闭对话框（不触发确认事件）
 */
const closeModal = () => {
    const dialogEl = dialogRef.value
    if (dialogEl && dialogEl.open) {
        dialogEl.close()
    }
    // 注意：不清空 currentKey，以便在下次打开前组件内部仍持有旧值，
    // 但 open 方法会立即覆盖，因此不影响正确性。若想彻底清空也可，但非必要。
}

const confirm = () => {
    // 将服务器 uuid 传递给父组件
    emit('confirm', currentKey.value)
    closeModal()
}

const cancel = () => {
    closeModal()
}

/**
 * 点击背景遮罩关闭（通过 @click.self 触发）
 */
const handleBackdropClick = () => {
    closeModal()
}

defineExpose({
  open
})
</script>

<template>
    <dialog ref="dialogRef" class="modal" @click.self="handleBackdropClick">
        <div class="modal-box">
            <h3 class="text-lg font-bold" v-show="props.title">{{ props.title }}</h3>
            <p class="text-sm text-base-content/70" v-show="props.subTitle">{{ props.subTitle }}</p>
            <p class="py-2">
                <slot name="content" />
            </p>
            <div class="modal-action">
                <button class="btn" :class="props.buttonCancelColor" @click="cancel"> {{ props.buttonCancelText }} </button>
                <button class="btn" :class="props.buttonConfirmColor" @click="confirm"> {{ props.buttonConfirmText }} </button>
            </div>
        </div>

        <!-- 点击背景关闭（自动触发 close 事件） -->
        <form method="dialog" class="modal-backdrop">
            <button></button>
        </form>
    </dialog>
</template>