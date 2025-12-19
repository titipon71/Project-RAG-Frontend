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

const statusConfig = computed(() => {
    const s = props.item.status
    if (s === 'public') return { color: 'success', label: 'Public Access', icon: 'i-heroicons-globe-alt' }
    if (s === 'private') return { color: 'error', label: 'Private Only', icon: 'i-heroicons-lock-closed' }
    if (s === 'pending') return { color: 'warning', label: 'Pending Review', icon: 'i-heroicons-clock' }
    return { color: 'neutral', label: s || 'Unknown', icon: 'i-heroicons-question-mark-circle' }
})
</script>

<template>
    <UModal :open="open" @update:open="emit('update:open', $event)" :ui="{
        content: 'sm:max-w-lg',
        overlay: 'backdrop-blur-sm'
    }">
        <template #header>
            <div class="flex items-center gap-4">
                <div
                    class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20">
                    <UIcon name="i-heroicons-information-circle" class="h-7 w-7 text-white" />
                </div>
                <div class="min-w-0 flex flex-col">
                    <p
                        class="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] mb-0.5">
                        Channel Information
                    </p>
                    <h3 class="text-xl font-black text-gray-900 dark:text-white truncate">
                        {{ item.title }}
                    </h3>
                </div>
            </div>
        </template>

        <template #body>
            <div class="space-y-6">
                <div
                    class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <div class="flex items-center gap-2">
                        <UIcon :name="statusConfig.icon" :class="['h-5 w-5', `text-${statusConfig.color}-500`]" />
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">สถานะการเข้าถึง</span>
                    </div>
                    <UBadge :color="statusConfig.color" variant="subtle" size="lg"
                        class="px-3 py-1 font-bold ring-1 ring-inset">
                        {{ statusConfig.label }}
                    </UBadge>
                </div>

                <div class="space-y-2.5">
                    <div
                        class="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
                        <UIcon name="i-heroicons-document-text" class="h-4 w-4" />
                        <span>รายละเอียด / คำอธิบาย</span>
                    </div>
                    <div
                        class="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-950 shadow-sm">
                        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {{ descriptionText }}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                        class="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20">
                        <div
                            class="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700">
                            <UIcon name="i-heroicons-user" class="h-5 w-5 text-primary-500" />
                        </div>
                        <div class="min-w-0">
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-tight">สร้างโดย</p>
                            <p class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                                {{ item.created_by_name || 'Anonymous' }}
                            </p>
                        </div>
                    </div>

                    <div
                        class="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20">
                        <div
                            class="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700">
                            <UIcon name="i-heroicons-calendar-days" class="h-5 w-5 text-primary-500" />
                        </div>
                        <div class="min-w-0">
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-tight">วันที่เริ่มใช้งาน
                            </p>
                            <p class="text-sm font-bold text-gray-800 dark:text-gray-200">
                                {{ createdAtText }}
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 p-5 shadow-lg shadow-primary-500/20">
                    <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
                    <div class="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-black/5 blur-xl"></div>

                    <div class="relative flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                                <UIcon name="i-heroicons-folder-open" class="h-6 w-6 text-white" />
                            </div>
                            <span class="text-sm font-bold text-white">เอกสารที่อัปโหลดแล้ว</span>
                        </div>
                        <div class="text-right text-white">
                            <span class="text-3xl font-black">{{ item.file_count ?? 0 }}</span>
                            <span class="text-xs font-medium ml-1 opacity-80 uppercase">Files</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex items-center justify-end w-full">
                <UButton color="neutral" variant="soft" @click="close"
                    class="px-6 py-2 rounded-xl font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95">
                    ปิดหน้าต่าง
                </UButton>
            </div>
        </template>
    </UModal>
</template>