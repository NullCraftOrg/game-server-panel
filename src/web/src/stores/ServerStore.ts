import { defineStore } from "pinia";
import { ref, reactive } from "vue"
import router from "@/router";
import { api } from "@/utils/api"
import type { ServerType } from "@/types/ServerType"
import type { FetchErrorType } from "@/types/FetchErrorType"

export const useServerStore = defineStore("server", () => {
    // 服务器数据
    const ServerData = ref<ServerType[]>([])
    const RefreshTime = ref<number>(0)
    // 轮询定时器
    let timer: number | null = null

    // 每个服务器独立的加载状态
    const actionLoadingMap: { [key: string]: boolean } = reactive({})

    function isLoading(uuid: string) {
        return !!actionLoadingMap[uuid]
    }

    function setLoading(uuid: string, loading: boolean) {
        if (loading) {
            actionLoadingMap[uuid] = true
        } else {
            delete actionLoadingMap[uuid]
        }
    }

    function openConsole(uuid: string) {
        router.push(`/servers/${uuid}/console`)
    }

    async function startServer(uuid: string | undefined, terminalSize?: { cols: number; rows: number }): Promise<boolean> {
        if (!uuid) return false
        setLoading(uuid, true)
        try {
            await api.startServer(uuid, terminalSize)
            await getServerByUUID(uuid) // 请求更新单个服务器数据
            return true
        }
        catch (error) {
            console.error("启动服务器失败:", "错误信息:", error)
        }
        finally {
            setLoading(uuid, false)
        }
        return false
    }

    async function stopServer(uuid: string | undefined): Promise<boolean> {
        if (!uuid) return false
        setLoading(uuid, true)
        try {
            await api.stopServer(uuid)
            await getServerByUUID(uuid) // 请求更新单个服务器数据
            return true
        }
        catch (error) {
            console.error("停止服务器失败:", "错误信息:", error)
        }
        finally {
            setLoading(uuid, false)
        }
        return false
    }

    async function restartServer(uuid: string | undefined): Promise<boolean> {
        if (!uuid) return false
        setLoading(uuid, true)
        try {
            await api.restartServer(uuid)
            await getServerByUUID(uuid) // 请求更新单个服务器数据
            return true
        }
        catch (error) {
            console.error("重启服务器失败:", "错误信息:", error)
        }
        finally {
            setLoading(uuid, false)
        }
        return false
    }

    /**
     * 请求服务器数据
     */
    async function fetchServerData() {
        try {
            ServerData.value = await api.getServers()
            RefreshTime.value = Date.now()
            console.debug("服务器数据已更新:", ServerData.value)
        }
        catch (error) {
            console.error("请求服务器数据失败:", "错误信息:", error)
        }
    }

    /**
     * 创建服务器数据
     * TODO: 可以考虑在创建后直接把新数据添加到 ServerData 列表中，而不是重新请求整个列表需要更改前后端接口返回/数据
     * @param data 服务器数据
     */
    async function createServer(data: ServerType) {
        try {
            const newServer = await api.createServer(data)
            fetchServerData()
        }
        catch (error) {
            console.error("创建服务器数据失败:", "错误信息:", error)
        }
    }

    /**
     * 请求更新单个服务器数据
     * @param uuid 服务器唯一Id
     * @return 获取到的服务器数据
     */
    async function getServerByUUID(uuid: string): Promise<ServerType | FetchErrorType | undefined> {
        try {
            // 注意：这里是是 api.getServerInfo()、api.getServer() 会包含一些不需要的数据
            const server = await api.getServerInfo(uuid)
            console.debug(`获取服务器 ${uuid} 的数据:`, server)

            // 把请求到的单个结果更新到 ServerData 列表中
            if (server && ServerData.value) {
                const index = ServerData.value.findIndex(s => s.uuid === uuid)
                if (index !== -1) {
                    ServerData.value[index] = server
                }
            }
            RefreshTime.value = Date.now()
            console.debug("服务器数据已更新:", ServerData.value)

            return server
        }
        catch (error) {
            console.error("请求服务器数据失败:", "错误信息:", error)
            // 解析错误状态码
            let status = 404
            let message = '未知错误'

            if (error instanceof Error) {
                message = error.message
            }

            // 返回错误信息对象
            return {
                ok: false,
                status,
                message
            }
        }
    }

    /**
     * 通过UUID更新服务器数据
     * @param uuid 服务器唯一Id
     * @param data tyep ServerType 类型服务器数据
     */
    async function updateServerByUUID(uuid: string, data: ServerType) {
        try {
            await api.updateServer(uuid, data)
            // 直接将更新后的数据更新到 ServerData 列表中
            if (ServerData.value) {
                patchServer(uuid, data)
            }
            RefreshTime.value = Date.now()
            console.debug("服务器数据已更新:", uuid)
        }
        catch (error) {
            console.error("更新服务器数据失败:", "错误信息:", error)
        }
    }

    /**
     * 内部辅助函数用于给定UUID的服务器数据进行局部更新，只更新变化的字段防止影响全局渲染
     * @param uuid 服务器唯一Id
     * @param updateData 更新数据
     * @returns 
     */
    function patchServer(uuid: string, updateData: Partial<ServerType>) {
        const target = ServerData.value.find(s => s.uuid === uuid)
        if (!target) return
        Object.keys(updateData).forEach(key => {
            const newVal = updateData[key as keyof ServerType]
            if (newVal !== target[key as keyof ServerType]) {
                (target as any)[key] = newVal
            }
        })
    }

    /**
     * 通过UUID删除服务器数据
     * @param uuid 服务器唯一Id
     */
    async function deleteServerByUUID(uuid: string) {
        try {
            await api.deleteServer(uuid)
            // 从 ServerData 列表中删除对应项
            if (ServerData.value) {
                ServerData.value = ServerData.value.filter(s => s.uuid !== uuid)
            }
            RefreshTime.value = Date.now()
            console.debug("服务器数据已更新:", uuid)
        }
        catch (error) {
            console.error("删除服务器数据失败:", "错误信息:", error)
        }
    }

    /**
     * 启动轮询
     * @param intervalMs 毫秒，默认1000ms
     */
    function startPolling(intervalMs: number = 1000): void {
        if (timer) return // 防止重复启动
        // 立即请求一次
        fetchServerData()
        // 设置定时器
        timer = window.setInterval(() => {
            fetchServerData()
        }, intervalMs)
    }

    /**
     * 停止轮询
     */
    function stopPolling(): void {
        if (timer) {
            clearInterval(timer)
            timer = null
        }
    }

    return {
        ServerData, RefreshTime,
        isLoading, setLoading,
        startServer, stopServer, restartServer, openConsole,
        fetchServerData, createServer, getServerByUUID, updateServerByUUID, deleteServerByUUID,
        startPolling, stopPolling
    }
})