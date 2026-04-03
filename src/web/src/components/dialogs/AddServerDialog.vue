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
            路径
            <input type="text" class="grow" v-model="formData.fileName" placeholder="C:/myserver/example.exe"
              @input="clearError('fileName')" />
            <span class="badge badge-neutral badge-xs">必填</span>
          </label>
          <p class="label">请输入要执行文件的完整路径</p>

          <!-- 附加命令 -->
          <legend class="fieldset-legend">附加命令</legend>
          <label class="input form-control w-full">
            命令行
            <input type="text" class="grow" v-model="formData.command" placeholder="-hello -world"
              @input="clearError('fileName')" />
            <span class="badge badge-neutral badge-xs">可选</span>
          </label>

          <!-- 运行目录 -->
          <legend class="fieldset-legend">运行目录</legend>
          <label class="input form-control w-full">
            目录路径
            <input type="text" class="grow" v-model="formData.cwd" placeholder="D:/serversaves"
              @input="clearError('fileName')" />
            <span class="badge badge-neutral badge-xs">可选</span>
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
  // 编辑模式下传入的服务器对象（包含 id 和所有字段）
  server: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['confirm', 'update:visible'])

// 判断是否为编辑模式
const isEditMode = computed(() => !!props.server?.id)

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

  // 构建返回数据：如果是编辑模式，包含 id 和所有字段；新建模式则只包含字段
  const result = {
    ...formData.value
  }
  if (isEditMode.value && props.server?.id) {
    result.id = props.server.id
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