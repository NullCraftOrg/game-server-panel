const BASE = `http://localhost:${__API_PORT__}/api`

// 从 localStorage 获取 token
function getToken(): string | null {
    return localStorage.getItem('token')
}

// 处理 401 未授权
function handleUnauthorized() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // 如果当前不在登录页，跳转
    if (window.location.pathname !== '/login') {
        window.location.href = '/login'
    }
}

/** 通用请求封装 */
async function request<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
        ...options,
        headers,
    })

    // 处理 401
    if (response.status === 401) {
        handleUnauthorized();
        throw new Error('未授权，请重新登录')
    }

    // 如果是 204 No Content 或不需要解析 JSON
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T
    }

    // 正常响应解析 JSON
    if (response.ok) {
        return response.json()
    }

    // 其他错误状态
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `请求失败 (${response.status})`)
}

export { BASE, request }