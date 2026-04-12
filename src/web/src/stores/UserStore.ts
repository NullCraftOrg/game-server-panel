// stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/utils/api'
import type { AuthType } from '@/types/AuthType'
import type { UserType } from '@/types/UserType'

export const useUserStore = defineStore('user', () => {
  /** 当前用户信息 */
  const user = ref<UserType | null>(null)
  /** 请求状态，判断是否在加载 */
  const loading = ref(false)
  /** 标记是否已初始化 */
  const initialized = ref(false)

  /** 注册 */
  async function register(email: string, username: string, password: string): Promise<AuthType> {
    const data = await authApi.register(email, username, password)
    localStorage.setItem('token', data.token);
    user.value = data.user;
    initialized.value = true;
    return data;
  }

  /** 登录 */
  async function login(username: string, password: string): Promise<AuthType> {
    const data = await authApi.login(username, password)
    localStorage.setItem('token', data.token);
    user.value = data.user;
    initialized.value = true;
    return data;
  }

  /** 获取当前用户(返回 UserType 或 null) */
  async function fetchUser(): Promise<UserType | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      user.value = null;
      initialized.value = true;
      return null;
    }

    loading.value = true;
    try {
      const data = await authApi.getUserInfo()
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

  /** 设置用户信息(用于外部封装登录成功调用同步数据) */
  function setUser(newUser: UserType) {
    user.value = newUser;
    initialized.value = true; // 标记已初始化，避免重复请求
  }

  /** 退出登录 */
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