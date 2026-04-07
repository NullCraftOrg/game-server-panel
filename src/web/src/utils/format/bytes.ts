/**
 * 将字节数转换为可读格式（支持指定目标单位或自动选择）
 * @param bytes 字节数
 * @param decimals 小数位数（默认 2）
 * @param targetUnit 目标单位（可选，不指定则自动选择最合适的单位）
 * @returns 格式化后的字符串，如 "1.5 MB"
 */
export default function formatBytes(
  bytes: number | null | undefined,
  decimals: number = 2,
  targetUnit?: 'B' | 'KiB' | 'MiB' | 'GiB' | 'TiB'
): string {
  // 处理无效输入
  if (bytes == null || isNaN(bytes)) return '0B';
  if (bytes === 0) return targetUnit ? `0${targetUnit}` : '0B';

  const k = 1024;
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];

  let unitIndex: number;

  if (targetUnit) {
    // 查找目标单位的索引
    unitIndex = units.indexOf(targetUnit);
    if (unitIndex === -1) {
      // 无效单位，回退到自动选择
      unitIndex = Math.floor(Math.log(bytes) / Math.log(k));
    }
  } else {
    // 自动选择最合适的单位
    unitIndex = Math.floor(Math.log(bytes) / Math.log(k));
  }

  // 限制索引范围
  unitIndex = Math.min(unitIndex, units.length - 1);

  const value = bytes / Math.pow(k, unitIndex);
  const formattedValue = parseFloat(value.toFixed(decimals));
  
  return `${formattedValue}${units[unitIndex]}`;
}