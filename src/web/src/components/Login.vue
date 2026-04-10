<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { a } from 'vue-router/dist/index-BzEKChPW.js';

const userStore = useUserStore()
const router = useRouter();
const isRegister = ref(false);
const username = ref('');
const password = ref('');
const error = ref('');

async function handleSubmit() {
  error.value = '';
  try {
    if (isRegister.value) {
      await userStore.register(username.value, password.value);
    } else {
      await userStore.login(username.value, password.value);
    }
    router.push('/'); // 登录/注册成功后跳转首页
  } catch (e: any) {
    error.value = e.response?.data?.error || '请求失败';
  }
}
</script>

<template>
  <div class="flex justify-center">
    <div>
      <form @submit.prevent="handleSubmit">

        <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-md border p-4 shadow">
          <legend class="fieldset-legend">{{ isRegister ? '注册' : '登录' }}</legend>

          <label class="label">用户名</label>
          <input type="text" class="input w-full" v-model="username" placeholder="用户名" required />

          <label class="label">Password</label>
          <input type="password" class="input w-full" v-model="password" placeholder="密码" required />

          <button class="btn btn-neutral mt-4" type="submit">{{ isRegister ? '注册' : '登录' }}</button>
        </fieldset>

      </form>

      <div class="text-center">
        <a class="link" @click="isRegister = !isRegister">
          切换到{{ isRegister ? '登录' : '注册' }}
        </a>

        <p v-if="error" class="text-error">{{ error }}</p>
      </div>

    </div>
  </div>

</template>