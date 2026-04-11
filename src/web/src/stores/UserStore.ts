// stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi, userApi } from '@/utils/api'
import type { AuthType } from '@/types/AuthType'
import type { UserType } from '@/types/UserType'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<UserType | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  // 注册
  async function register(username: string, password: string): Promise<AuthType> {
    const data = await authApi.register(username, password)
    localStorage.setItem('token', data.token);
    user.value = data.user;
    initialized.value = true;
    return data;
  }

  // 登录
  async function login(username: string, password: string): Promise<AuthType> {
    const data = await authApi.login(username, password)
    localStorage.setItem('token', data.token);
    user.value = data.user;
    initialized.value = true;
    return data;
  }

  // 获取当前用户（返回 UserType | null）
  async function fetchUser(): Promise<UserType | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      user.value = null;
      initialized.value = true;
      return null;
    }

    loading.value = true;
    try {
      const data = await userApi.getUserInfo()
      user.value = data;
      initialized.value = true;
      return data;
    } catch {
      localStorage.removeItem('token');
      user.value = null;
      initialized.value = true;
      return null;
    } finally {
      loading.value = false;
    }
  }

  // 设置用户信息（登录成功后调用）
  function setUser(newUser: UserType) {
    user.value = newUser;
    initialized.value = true; // 标记已初始化，避免重复请求
  }

  // 退出登录
  function logout() {
    // 清空内存中的用户
    user.value = null;
    // 重置初始化状态，以便下次登录后重新获取
    initialized.value = false;
    // 清除本地存储的 token
    localStorage.removeItem('token');
  }

  return {
    user,
    loading,
    initialized,
    register,
    login,
    fetchUser,
    setUser,
    logout,
  };
});