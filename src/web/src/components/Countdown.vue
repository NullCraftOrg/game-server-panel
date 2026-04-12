<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    count: number | string | undefined | null
}>()

// 将 count 转换为有效数字，无效时返回 0
const numericCount = computed(() => {
    const val = props.count;
    if (val === undefined || val === null) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
})
</script>

<template>
    <!-- 倒计时组件目前最大999，大于999时直接显示数字 -->
    <template v-if="numericCount <= 999">
        <span class="countdown">
            <span :style="{ '--value': numericCount }" aria-live="polite" :aria-label="String(numericCount)">
                {{ numericCount }}
            </span>
        </span>
    </template>
    <template v-else>
        {{ numericCount }}
    </template>
</template>