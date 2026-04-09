import { ref, onMounted, onUnmounted } from 'vue'

// 主题模式：亮色、暗色、跟随系统
type ThemeMode = 'light' | 'dark' | 'auto'

// 存储键名
const STORAGE_KEY = 'theme-mode'

export function useTheme() {
  // 默认自动
  const mode = ref<ThemeMode>('auto')
  const applied = ref<'light' | 'dark'>('light')

  let mediaQuery: MediaQueryList | null = null

  // 获取系统主题
  const getSystemTheme = (): 'light' | 'dark' =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  const apply = () => {
    const newTheme = mode.value === 'auto' ? getSystemTheme() : mode.value
    if (document.documentElement.getAttribute('data-theme') !== newTheme) {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
    applied.value = newTheme
  }

  // 设置主题模式
  const setMode = (newMode: ThemeMode) => {
    mode.value = newMode
    localStorage.setItem(STORAGE_KEY, newMode)
    apply()
  }

  // 获取当前主题模式
  const getMode = () => mode.value

  // 获取当前应用的主题
  const getCurrentTheme = () => applied.value

  const load = () => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      mode.value = saved
    } else {
      mode.value = 'auto' // 默认 auto
    }
    apply()
  }

  const onSystemChange = () => {
    if (mode.value === 'auto') apply()
  }

  onMounted(() => {
    load()
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', onSystemChange)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', onSystemChange)
  })

  return { mode, applied, setMode, getMode, getCurrentTheme }
}