const os = require('os');

const manager = require('./serverManager');
const config = require('./utils/config');
const CPUMonitor = require('./utils/cpuMonitor');

class SystemMonitor {
    constructor() {
        // 创建 CPU 监控实例，可传入自定义采样间隔
        this.cpuMonitor = new CPUMonitor(1000);
    }

    getInfo() {
        const servers = manager.list();
        const runningServers = servers.filter(item => item.isRunning === true);

        const appInfo = {
            ip: config.ip,
            port: config.port,
            servers: {
                total: servers.length,
                running: runningServers.length,
            },
        };

        const cpus = os.cpus();
        const cpuUsage = this.cpuMonitor.getUsage();

        const systemInfo = {
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
            },
            ram: {
                total: os.totalmem(),
                free: os.freemem(),
                usage: os.totalmem() - os.freemem(),
                usagePercent: (1 - os.freemem() / os.totalmem()) * 100,
            },
        };

        const nodejsInfo = {
            pid: process.pid,
            version: process.version,
            uptime: process.uptime(),
            cpu: process.cpuUsage(),
            ram: process.memoryUsage(),
        };

        return {
            app_info: appInfo,
            system_info: systemInfo,
            nodejs_info: nodejsInfo,
        };
    }

    // 提供销毁方法，清理资源
    destroy() {
        if (this.cpuMonitor) {
            this.cpuMonitor.stop();
        }
    }
}

module.exports = new SystemMonitor();