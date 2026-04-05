<template>
  <dialog ref="dialogRef" class="modal" @close="handleClose">
    <div class="modal-box w-11/12 max-w-5xl">
      <!-- 动态标题 -->
      <h3 class="text-lg font-bold">
        {{ isEditMode ? '编辑服务器' : '新建服务器' }}
      </h3>

      <!-- 表单区域 -->
      <div class="flex flex-col">
        <!-- 服务器名称 -->
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-3 pt-1">
          <legend class="fieldset-legend">服务器名称</legend>
          <label class="input form-control w-full">
            <svg class="h-[1.25em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path
                  d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
              </g>
            </svg>
            <input type="text" class="grow" v-model="formData.name" placeholder="请输入服务器名称"
              @input="clearError('name')" />
            <span class="badge badge-neutral badge-xs">必填</span>
          </label>
        </fieldset>

        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box border px-3 py-2 pt-0">
          <legend class="fieldset-legend">配置可执行文件</legend>

          <!-- 运行文件 -->
          <legend class="fieldset-legend">执行文件</legend>
          <label class="input form-control w-full">
            <svg class="h-[1.25em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path
                  d="M4 11V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h7" />
                <path d="M14 2v5a1 1 0 0 0 1 1h5M10 18l3-3l-3-3" />
              </g>
            </svg>
            <input type="text" class="grow" v-model="formData.fileName" placeholder="C:\myserver\example.exe"
              @input="clearError('fileName')" />
            <span class="badge badge-neutral badge-xs">必填</span>
          </label>
          <p class="label">请输入要执行文件的完整路径</p>

          <!-- 附加命令 -->
          <legend class="fieldset-legend">附加命令</legend>
          <label class="input form-control w-full">
            <svg class="h-[1.25em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path
                  d="M4 12.15V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3.35" />
                <path d="M14 2v5a1 1 0 0 0 1 1h5M5 16l-3 3l3 3m4 0l3-3l-3-3" />
              </g>
            </svg>
            <input type="text" class="grow" v-model="formData.command" placeholder="-hello -world"
              @input="clearError('fileName')" />
          </label>

          <!-- 运行目录 -->
          <legend class="fieldset-legend">运行目录</legend>
          <label class="input form-control w-full">
            <svg class="h-[1.25em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path
                  d="M2 9.35V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h7" />
                <path d="m8 16l3-3l-3-3" />
              </g>
            </svg>
            <input type="text" class="grow" v-model="formData.cwd" placeholder="D:\serversaves"
              @input="clearError('fileName')" />
          </label>
          <p class="label">通常为服务器文件所在目录</p>
        </fieldset>

        <label class="mt-2">
          <input type="checkbox" v-model="formData.forceUtf8Mode" :checked="formData.forceUtf8Mode"
            class="checkbox checkbox-primary" />
          启用强兼容UTF8模式(中文乱码时勾选)
        </label>

        <!-- 错误提示 -->
        <p v-if="errorMsg" class="text-error text-sm mt-2">{{ errorMsg }}</p>
      </div>

      <!-- 操作按钮 -->
      <div class="modal-action">
        <button class="btn" @click="cancel">取消</button>
        <button class="btn btn-primary" @click="confirm">
          {{ isEditMode ? '更新服务器' : '创建服务器' }}
        </button>
      </div>
    </div>

    <!-- 点击背景关闭 -->
    <!-- <form method="dialog" class="modal-backdrop">
      <button>关闭</button>
    </form> -->
  </dialog>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'

const props = defineProps({
  // 控制对话框显示/隐藏
  visible: {
    type: Boolean,
    default: false
  },
  // 编辑模式下传入的服务器对象（包含 uuid 和所有字段）
  server: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['confirm', 'update:visible'])

// 判断是否为编辑模式
const isEditMode = computed(() => !!props.server?.uuid)

// 表单数据
const formData = ref({
  name: '',
  fileName: '',
  command: '',
  cwd: '',
  forceUtf8Mode: false,
})

const errorMsg = ref('')
const dialogRef = ref(null)

// 重置表单（清空所有输入）
const resetForm = () => {
  formData.value = {
    name: '',
    fileName: '',
    command: '',
    cwd: '',
    forceUtf8Mode: false,
  }
  errorMsg.value = ''
}

// 从传入的 server 对象填充表单
const fillForm = () => {
  if (props.server) {
    formData.value = {
      name: props.server.name || '',
      fileName: props.server.fileName || '',
      command: props.server.command || '',
      cwd: props.server.cwd || '',
      forceUtf8Mode: props.server.forceUtf8Mode || false,
    }
  } else {
    resetForm()
  }
}

// 清除指定字段的错误提示
const clearError = () => {
  errorMsg.value = ''
}

// 表单验证
const validateForm = () => {
  const { name, fileName } = formData.value
  if (!name?.trim()) {
    errorMsg.value = '请填写服务器名称'
    return false
  }
  if (!fileName?.trim()) {
    errorMsg.value = '请填写运行文件的完整路径'
    return false
  }
  return true
}

// 关闭对话框
const closeDialog = () => {
  emit('update:visible', false)
}

// 确认提交
const confirm = () => {
  if (!validateForm()) return

  // 构建返回数据：如果是编辑模式，包含 uuid 和所有字段；新建模式则只包含字段
  const result = {
    ...formData.value
  }
  if (isEditMode.value && props.server?.uuid) {
    result.uuid = props.server.uuid
  }

  emit('confirm', result)
  closeDialog()
}

// 取消
const cancel = () => {
  closeDialog()
}

// 监听 visible 变化，控制对话框显示/隐藏
watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      // 打开时根据是否编辑模式填充表单
      fillForm()
      await nextTick()
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
    }
  },
  { immediate: true }
)

// 当 server 发生变化时（例如外部编辑对象改变），同步更新表单（仅在可见时可选）
watch(
  () => props.server,
  () => {
    if (props.visible) {
      fillForm()
    }
  }
)

// 对话框通过背景/ESC 关闭时同步状态
const handleClose = () => {
  emit('update:visible', false)
}
</script>