<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const isRegister = computed(() => route.name === 'Register')

const isLoading = ref(false)
const username = ref('');
const password = ref('');
const error = ref('');

async function handleSubmit() {
  error.value = ''
  isLoading.value = true
  try {
    if (isRegister.value) {
      await userStore.register(username.value, password.value)
    } else {
      await userStore.login(username.value, password.value)
    }
    router.push('/') // 登录/注册成功后跳转首页
  } catch (e: any) {
    error.value = e.response?.data?.error || isRegister.value ? '注册失败' : '登录失败' + '，请检查用户名和密码是否正确';
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center">

    <div>
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
          <input type="text" class="input w-full" v-model="username" placeholder="用户名" required />

          <label class="label">密码</label>
          <input type="password" class="input w-full" v-model="password" placeholder="密码" required />

          <button class="btn btn-neutral mt-4" type="submit" :disabled="isLoading">
            <span v-show="isLoading" class="loading loading-sm loading-spinner"></span>
            {{ isRegister ? '注册' : '登录' }}
          </button>
        </fieldset>

      </form>

      <div class="text-center">
        <RouterLink :to="isRegister ? '/login' : '/register'" class="link" @click="isRegister = !isRegister">
          {{ isRegister ? '已有' : '没有' }}账号? {{ isRegister ? '去登录' : '去注册' }}
        </RouterLink>
      </div>

    </div>
  </div>

</template>