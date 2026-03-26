<script setup>
import { ref } from 'vue'
import { api } from '../api'

const name = ref('')
const fileName = ref('')
const command = ref('')
const cwd = ref('')

const fileInfo = ref(null)

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    fileInfo.value = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModifiedDate: new Date(file.lastModified)
    }
    fileName.value = fileInfo.value.name;
  } else {
    fileInfo.value = null
  }
}

async function create() {
  await api.createServer({
    name: name.value,
    fileName: fileName.value,
    command: command.value,
    cwd: cwd.value || '.'
  })

  location.reload()
}
</script>

<template>
  <h3>新建服务器</h3>
  <input class="input" v-model="name" placeholder="名称" />
  <input class="input" v-model="fileName" placeholder="启动文件" />
  <input class="input" v-model="command" placeholder="启动命令" />
  <input class="input" v-model="cwd" placeholder="目录" />
  <button class="btn btn-sm" @click="create">创建</button>

  <div>
<fieldset class="fieldset">
  <legend class="fieldset-legend">Pick a file</legend>
  <input type="file" class="file-input" @change="handleFileChange"/>
  <label class="label">Max size 2MB</label>
</fieldset>

    <div v-if="fileInfo">
      <p>文件名：{{ fileInfo.name }}</p>
      <p>文件大小：{{ (fileInfo.size / 1024).toFixed(2) }} KB</p>
      <p>文件类型：{{ fileInfo.type || '未知' }}</p>
      <p>最后修改时间：{{ fileInfo.lastModifiedDate.toLocaleString() }}</p>
    </div>
  </div>
</template>