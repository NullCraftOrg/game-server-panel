const percentTextColorMap = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error'
}

const percentBgColorMap = {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error'
}

/**
 * 根据百分比返回对应的文本颜色类
 * @param percent 百分比
 * @returns 文本颜色类
 */
function formatPercentToTextColor(percent: number): string {
    if (percent > 80) return percentTextColorMap.error
    if (percent > 60) return percentTextColorMap.warning
    return percentTextColorMap.success
}

/**
 * 根据百分比返回对应的背景颜色类
 * @param percent 百分比
 * @returns 背景颜色类
 */
function formatPercentToBgColor(percent: number): string {
    if (percent > 80) return percentBgColorMap.error
    if (percent > 60) return percentBgColorMap.warning
    return percentBgColorMap.success
}

export { formatPercentToTextColor, formatPercentToBgColor }