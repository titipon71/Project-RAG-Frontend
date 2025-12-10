<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    open: boolean
    item: {
        channels_id: number
        title: string
        description?: string | null
        status?: string | null
        created_by_name: string
        created_at?: string | null
        file_count?: number | null
    }
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'detail'): void // กดเพื่อไปหน้าแชนแนล
}>()

const close = () => {
    emit('update:open', false)
}

// --- Display Logic ---

const descriptionText = computed(() =>
    props.item.description?.trim() || 'ยังไม่ได้ระบุรายละเอียดสำหรับแชนแนลนี้'
)

const createdAtText = computed(() => {
    if (!props.item.created_at) return 'ไม่ทราบวันที่'
    return new Date(props.item.created_at).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
})

// ปรับสี Badge ให้ตรงกับหน้า List (Public/Private)
const statusColor = computed(() => {
    const s = props.item.status
    if (s === 'public') return 'success'
    if (s === 'private') return 'error'
    if (s === 'pending') return 'warning'
    return 'neutral'
})

// ปรับข้อความ Badge
const statusLabel = computed(() => {
    const s = props.item.status
    if (s === 'public') return 'Public'
    if (s === 'private') return 'Private'
    if (s === 'pending') return 'Pending'
    return s || 'Unknown'
})
</script>

<template>
    <UModal :open="open" @update:open="emit('update:open', $event)">

        <template #header>
            <div class="flex items-center gap-3">
                <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
                    <UIcon name="i-lucide-monitor-play" class="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div class="min-w-0 flex flex-col">
                    <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Channel Detail
                    </p>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {{ item.title }}
                    </h3>
                </div>
            </div>
        </template>

        <template #body>
            <div class="space-y-5">

                <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-gray-500">สถานะ:</span>
                        <UBadge :color="statusColor" variant="subtle" size="md" class="capitalize">
                            {{ statusLabel }}
                        </UBadge>
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                        <UIcon name="i-lucide-file-text" class="h-4 w-4" />
                        <span>คำอธิบาย</span>
                    </div>
                    <div
                        class="rounded-lg border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {{ descriptionText }}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                        <div
                            class="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <UIcon name="i-lucide-user" class="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                สร้างโดย
                            </p>
                            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                                {{ item.created_by_name || '-' }}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                        <div
                            class="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <UIcon name="i-lucide-calendar-clock" class="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                วันที่สร้าง
                            </p>
                            <p class="text-sm font-semibold text-gray-900 dark:text-white">
                                {{ createdAtText }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-folder-open" class="h-5 w-5 text-gray-400" />
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
                            ไฟล์ทั้งหมด
                        </span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-lg font-bold text-gray-900 dark:text-white">
                            {{ item.file_count ?? 0 }}
                        </span>
                        <span class="text-xs text-gray-500 mt-1">ไฟล์</span>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-2">
                    <UButton color="neutral" variant="subtle" @click="close">
                        ปิด
                    </UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>