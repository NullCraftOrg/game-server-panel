/** 系统监控接口 */
export interface SystemMonitorType {
    readonly app_info: AppInfo,
    readonly system_info: SystemInfo,
    readonly nodejs_info: NodejsInfo,
}

/** 定义各信息对象的接口 */
export interface AppInfo {
    readonly ip: string
    readonly port: number | string
    readonly servers: {
        readonly total: number
        readonly running: number
    }
}

/** 系统信息数据 */
export interface SystemInfo {
    readonly hostname: string
    readonly uptime: number
    readonly os: {
        readonly type: string
        readonly release: string
        readonly platform: string
    }
    cpu: {
        readonly total: number
        readonly model: string
        readonly arch: string
        readonly usagePercent: number
        readonly coresUsage: number[]
        readonly usagePercentData: number[]
    }
    ram: {
        readonly total: number
        readonly free: number
        readonly usage: number
        readonly usagePercent: number
        readonly usagePercentData: number[]
    }
}


/** Node.js 相关信息接口 */
export interface NodejsInfo {
    readonly pid: number
    readonly version: string
    readonly uptime: number
    readonly cpu: {
        readonly user: number;
        readonly system: number;
    }
    readonly ram: {
        readonly rss: number;
        readonly heapTotal: number;
        readonly heapUsed: number;
        readonly external: number;
        readonly arrayBuffers: number;
    }
}