<template>
  <dialog ref="dialogRef" class="modal" @close="handleClose">
    <div class="modal-box">
      <h3 class="text-lg font-bold">{{ title }}</h3>
      <p class="py-4">{{ content }}</p>
      <div class="modal-action">
        <button class="btn" @click="cancel">取消</button>
        <button class="btn btn-primary" @click="confirm">确定</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>关闭</button>
    </form>
  </dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  title: String,
  content: String
})

const emit = defineEmits(['confirm', 'cancel', 'update:visible'])

const dialogRef = ref(null)

// 监听 visible 变化，打开/关闭对话框
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

const confirm = () => {
  emit('confirm')
  close()
}

const cancel = () => {
  emit('cancel')
  close()
}

const close = () => {
  emit('update:visible', false)
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>