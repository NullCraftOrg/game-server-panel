<template>
  <dialog ref="dialogRef" class="modal" @close="handleClose">
    <div class="modal-box">
      <h3 class="text-lg font-bold">确认删除</h3>
      <p class="py-4">
        确定要删除服务器 <strong class="text-error">{{ selectedServer?.name }}</strong> 吗？
      </p>
      <div class="modal-action">
        <button class="btn" @click="cancel">取消</button>
        <button class="btn btn-error" @click="confirm">确定删除</button>
      </div>
    </div>

    <!-- 点击背景关闭（自动触发 close 事件） -->
    <form method="dialog" class="modal-backdrop">
      <button>关闭</button>
    </form>
  </dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // 待删除的服务器对象，包含 name 和 uuid 等字段
  selectedServer: {
    type: Object,
    default: null
  },
  // 控制对话框可见性
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'update:visible'])

const dialogRef = ref(null)

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

const closeDialog = () => {
  emit('update:visible', false)
}

const confirm = () => {
  // 将服务器 uuid 传递给父组件
  emit('confirm', props.selectedServer?.uuid)
  closeDialog()
}

const cancel = () => {
  closeDialog()
}

const handleClose = () => {
  // 当通过背景或 ESC 关闭时，同步状态
  emit('update:visible', false)
}
</script>