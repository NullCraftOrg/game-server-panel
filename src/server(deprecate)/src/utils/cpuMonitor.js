const os = require('os');

class CPUMonitor {
    /**
     * @param {number} sampleInterval 采样间隔（毫秒），默认 1000ms
     */
    constructor(sampleInterval = 1000) {
        this.sampleInterval = sampleInterval;
        this.cachedUsage = { avg: 0, cores: [], timestamp: Date.now() };
        this.lastCPUInfo = null;
        this.timer = null;
        this._start();
    }

    // 获取当前各核心的累计时间
    _getCPUInfo() {
        const cpus = os.cpus();
        const times = cpus.map(cpu => ({
            user: cpu.times.user,
            nice: cpu.times.nice,
            sys: cpu.times.sys,
            idle: cpu.times.idle,
            irq: cpu.times.irq,
        }));
        return { times, timestamp: Date.now() };
    }

    // 根据两次采样计算 CPU 使用率
    _calculateUsage(start, end) {
        const usageList = [];
        for (let i = 0; i < start.times.length; i++) {
            const s = start.times[i];
            const e = end.times[i];

            const userDelta = e.user - s.user;
            const niceDelta = e.nice - s.nice;
            const sysDelta = e.sys - s.sys;
            const idleDelta = e.idle - s.idle;
            const irqDelta = e.irq - s.irq;

            const totalDelta = userDelta + niceDelta + sysDelta + idleDelta + irqDelta;
            const activeDelta = userDelta + niceDelta + sysDelta + irqDelta;
            const usage = totalDelta === 0 ? 0 : (activeDelta / totalDelta) * 100;
            usageList.push(usage);
        }
        const avg = usageList.reduce((a, b) => a + b, 0) / usageList.length;
        return { avg, cores: usageList };
    }

    // 定时更新缓存
    _update() {
        const current = this._getCPUInfo();
        if (this.lastCPUInfo) {
            const usage = this._calculateUsage(this.lastCPUInfo, current);
            this.cachedUsage = {
                avg: usage.avg,
                cores: usage.cores,
                timestamp: Date.now(),
            };
        }
        this.lastCPUInfo = current;
    }

    // 启动定时采样
    _start() {
        this.lastCPUInfo = this._getCPUInfo();
        this.timer = setInterval(() => this._update(), this.sampleInterval);
        // 可选：让定时器不阻止进程退出（适合作为守护模块）
        if (this.timer.unref) this.timer.unref();
    }

    // 停止采样（用于清理）
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // 获取当前缓存的 CPU 使用率（返回副本）
    getUsage() {
        return { ...this.cachedUsage };
    }
}

module.exports = CPUMonitor;