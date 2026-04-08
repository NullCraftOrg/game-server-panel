const percentTextColorMap = {
    none: 'bg-base-300',
    success: 'text-success',
    warning: 'text-orange-300',
    error: 'text-error'
}

const percentBgColorMap = {
    none: 'bg-base-300',
    success: 'bg-success',
    warning: 'bg-orange-300',
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

/**
 * 目前专门给全部核心背景色用低于 60% 返回基本色而非绿色
 * @param percent 
 * @returns 
 */
function formatCoresPercentToBgColor(percent: number): string {
    if (percent > 80) return percentBgColorMap.error
    if (percent > 60) return percentBgColorMap.warning
    return percentBgColorMap.none
}

export { formatPercentToTextColor, formatPercentToBgColor, formatCoresPercentToBgColor }