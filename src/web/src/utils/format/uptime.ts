/**
 * 将秒数格式化：如 "1天2小时3分钟4秒"
 * @param seconds 秒
 * @returns 格式化后的字符串
 */
export default function formatUptime(seconds: number): string {
    if (seconds == null || isNaN(seconds) || seconds < 0) return '0秒'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const parts = []
    if (days > 0) parts.push(`${days}天`)
    if (hours > 0) parts.push(`${hours}小时`)
    if (minutes > 0) parts.push(`${minutes}分钟`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`)
    return parts.join('')
}