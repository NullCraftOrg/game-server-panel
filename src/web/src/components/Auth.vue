<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const isLoading = ref(false)
const username = ref('')
const password = ref('')
const error = ref('')

// 根据路由名称判断是注册还是登录模式
const isRegister = computed(() => route.name === 'Register')

// 监听路由变化，切换模式时清空表单和错误
watch(
  () => route.name,
  () => {
    username.value = ''
    password.value = ''
    error.value = ''
  }
)

async function handleSubmit() {
  error.value = ''
  // 基础判断
  if (!username.value.trim() || !password.value.trim()) {
    error.value = '用户名和密码不能为空'
    return
  }

  isLoading.value = true
  try {
    // 根据路由进行注册/登录
    if (isRegister.value) {
      await userStore.register(username.value, password.value)
    } else {
      await userStore.login(username.value, password.value)
    }
    // 成功后转到根
    router.push('/')
  }
  catch (e: any) {
    const defaultMsg = isRegister.value ? '注册失败' : '登录失败'
    const detail = e.response?.data?.error || '，请检查填写信息是否正确'
    error.value = defaultMsg + detail
  }
  finally {
    isLoading.value = false
  }
}

// 用户名 autocomplete 控制
const usernameAutocomplete = computed(() => 'username')

// 密码 autocomplete 控制
const passwordAutocomplete = computed(() =>
  isRegister.value ? 'new-password' : 'current-password'
)
</script>

<template>
  <div class="flex justify-center">
    <div>
      <!-- 错误提示 -->
      <div v-if="error" role="alert" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <form class="my-3" @submit.prevent="handleSubmit">
        <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-md border p-4 shadow">
          <legend class="fieldset-legend">{{ isRegister ? '注册' : '登录' }}</legend>

          <label class="label">用户名</label>
          <input type="text" class="input w-full" v-model="username" placeholder="用户名" required
            :autocomplete="usernameAutocomplete" />

          <label class="label">密码</label>
          <input type="password" class="input w-full" v-model="password" placeholder="密码" required
            :autocomplete="passwordAutocomplete" />

          <button class="btn btn-neutral mt-4" type="submit" :disabled="isLoading">
            <span v-show="isLoading" class="loading loading-sm loading-spinner"></span>
            {{ isRegister ? '注册' : '登录' }}
          </button>
        </fieldset>
      </form>

      <div class="text-center">
        <RouterLink :to="isRegister ? '/login' : '/register'" class="link">
          {{ isRegister ? '已有' : '没有' }}账号? {{ isRegister ? '去登录' : '去注册' }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>