import os from 'node:os'
import CPUMonitor from '../utils/cpuMonitor.ts'
import ServerManager from './serverManager.ts'

// 定义各信息对象的接口
interface AppInfo {
    ip: string
    port: number | string
    servers: {
        total: number
        running: number
    }
}

// CPU数据组信息
interface CpuInfo {
    total: number
    model: string
    arch: string
    usagePercent: number
    coresUsage: number[]
    usagePercentData: number[]
}

// 系统信息数据
interface SystemInfo {
    hostname: string
    uptime: number
    os: {
        type: string
        release: string
        platform: string
    }
    cpu: CpuInfo
    ram: {
        total: number
        free: number
        usage: number
        usagePercent: number
        usagePercentData: number[]
    }
}

// nodejs基本信息数据
interface NodejsInfo {
    pid: number
    version: string
    uptime: number
    cpu: NodeJS.CpuUsage
    ram: NodeJS.MemoryUsage
}

// 返回数据组
interface MonitorData {
    app_info: AppInfo
    system_info: SystemInfo
    nodejs_info: NodejsInfo
}

class SystemMonitor {
    private cpuMonitor: InstanceType<typeof CPUMonitor>
    private cpuUsagePercentData: number[] = []
    private ramUsagePercentData: number[] = []

    constructor() {
        // 创建 CPU 监控实例，可传入自定义采样间隔
        this.cpuMonitor = new CPUMonitor(1000)
    }

    // 更新 CPU 使用率数据并返回最新数据组
    private updateCpuUsageData(): number[] {
        const cpuUsageAvg = this.cpuMonitor.getUsage().avg
        this.cpuUsagePercentData.push(cpuUsageAvg)
        // 记录最近数据条目数
        if (this.cpuUsagePercentData.length > 60) {
            this.cpuUsagePercentData.shift()
        }
        return this.cpuUsagePercentData;
    }

    // 更新 RAM 使用率数据并返回最新数据组
    private updateRamUsageData(): number[] {
        const ramUsage = (1 - os.freemem() / os.totalmem()) * 100
        this.ramUsagePercentData.push(ramUsage)
        // 记录最近数据条目数
        if (this.ramUsagePercentData.length > 60) {
            this.ramUsagePercentData.shift()
        }
        return this.ramUsagePercentData;
    }

    /**
     * 获取系统监控数据
     * @returns 监控数据
     */
    getInfo(): MonitorData {

        const servers = ServerManager.list()
        const runningServers = servers.filter(item => item.isRunning === true)

        const appInfo: AppInfo = {
            ip: 'localhost',
            port: 9119,
            servers: {
                total: servers.length,
                running: runningServers.length
            }
        }

        const cpus = os.cpus()
        const cpuUsage = this.cpuMonitor.getUsage()

        const systemInfo: SystemInfo = {
            hostname: os.hostname(),
            uptime: os.uptime(),
            os: {
                type: os.type(),
                release: os.release(),
                platform: os.platform(),
            },
            cpu: {
                total: cpus.length,
                model: cpus[0]?.model || 'Unknown',
                arch: os.arch(),
                usagePercent: cpuUsage.avg,
                coresUsage: cpuUsage.cores,
                usagePercentData: this.updateCpuUsageData(),
            },
            ram: {
                total: os.totalmem(),
                free: os.freemem(),
                usage: os.totalmem() - os.freemem(),
                usagePercent: (1 - os.freemem() / os.totalmem()) * 100,
                usagePercentData: this.updateRamUsageData(),
            },
        }

        const nodejsInfo: NodejsInfo = {
            pid: process.pid,
            version: process.version,
            uptime: process.uptime(),
            cpu: process.cpuUsage(),
            ram: process.memoryUsage(),
        }

        return {
            app_info: appInfo,
            system_info: systemInfo,
            nodejs_info: nodejsInfo,
        }
    }

    // 清理资源
    destroy(): void {
        if (this.cpuMonitor) {
            this.cpuMonitor.stop()
        }
    }
}

export default new SystemMonitor()