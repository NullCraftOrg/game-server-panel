/**
 * 微秒转毫秒
 * @param microseconds 微秒
 * @returns 毫秒
 */
export default function formatMicroToMillisecond(microseconds: number | null | undefined):string {
    if (microseconds == null || isNaN(microseconds)) return '0µs'
    if (microseconds < 1000) return `${microseconds}µs`
    return `${(microseconds / 1000).toFixed(1)}ms`
}