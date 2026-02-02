<script setup lang="ts">
const { createApi, listApiKeys, revokeApiKey, loading: apiKeysLoading } = useApiKeys()
const toast = useToast()

const props = defineProps<{
    item: {
        title?: string
        channels_id: number | string
    }
}>()

const isOpen = defineModel<boolean>('modelValue', { default: false })

// State
const form = reactive({
    name: '',
})

const resultSecret = ref('') // เก็บค่า secret ที่ได้มา
const apiKeysList = ref<any[]>([]) // รายการ API Keys ที่มีอยู่
const deleteModal = ref(false) // เปิด/ปิด Delete Modal
const selectedKey = ref<any>(null) // Key ที่เลือกจะลบ

// ตั้งชื่อเริ่มต้นตามชื่อ Channel
watch(() => props.item, (val) => {
    if (val) form.name = ``
}, { immediate: true })

// ดึงรายการ API Keys เมื่อเปิด Modal
const fetchApiKeys = async () => {
    try {
        const res = await listApiKeys()
        // กรอง Keys ที่เป็นของ channel นี้เท่านั้น
        apiKeysList.value = res.filter((key: any) =>
            String(key.channel_id) === String(props.item.channels_id)
        )
    } catch (e: any) {
        console.error('Failed to fetch API keys:', e)
    }
}

// ฟังก์ชันคัดลอก
const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text)
        toast.add({
            title: 'คัดลอกแล้ว!',
            description: 'คัดลอกลงในคลิปบอร์ดแล้ว',
            icon: 'i-heroicons-check-circle',
            color: 'success'
        })
    } catch (err) {
        toast.add({ title: 'ล้มเหลว', description: 'ไม่สามารถคัดลอกได้', color: 'error' })
    }
}

// สร้าง API Key
const handleCreateAPI = async () => {
    if (!form.name.trim()) return

    try {
        const res = await createApi({
            name: form.name.trim(),
            channel_id: String(props.item.channels_id)
        })

        if (res?.key_secret) {
            resultSecret.value = res.key_secret
            // Refresh รายการหลังสร้างเสร็จ
            await fetchApiKeys()
            // Reset form
            form.name = `Key for ${props.item.title || 'Channel'}`
        }
    } catch (e: any) {
        toast.add({
            title: 'เกิดข้อผิดพลาด',
            description: e.data?.detail?.[0]?.msg || 'ไม่สามารถสร้าง Key ได้',
            color: 'error'
        })
    }
}

// เปิด Delete Modal
const confirmDelete = (key: any) => {
    selectedKey.value = key
    deleteModal.value = true
}

// ลบ API Key (ใช้ใน ModalDelete)
const handleDeleteKey = async (keyId: string | number) => {
    await revokeApiKey(Number(keyId))
}

// หลังลบสำเร็จ
const onDeleted = async () => {
    await fetchApiKeys()
    selectedKey.value = null
}

// ดึงข้อมูลเมื่อ Modal เปิด
watch(isOpen, (val) => {
    if (val) {
        fetchApiKeys()
        resultSecret.value = '' // Reset secret
    }
})

// จัดรูปแบบวันที่
const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>

<template>
    <UModal v-model="isOpen">
        <UButton label=" API Keys" icon="i-heroicons-key" color="primary" variant="soft" size="sm" />
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span class="font-bold text-lg">API Access Keys</span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.title }}</p>
                    </div>
                </div>
                <UBadge color="primary" variant="subtle" size="lg">
                    <UIcon name="i-heroicons-key" class="w-3 h-3 mr-1" />
                    {{ apiKeysList.length }} Keys
                </UBadge>
            </div>
        </template>

        <template #body>
            <div class="space-y-6">

                <!-- Secret Display (แสดงเมื่อเพิ่งสร้างเสร็จ) -->
                <div v-if="resultSecret"
                    class="relative overflow-hidden p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-300 dark:border-green-800 rounded-2xl shadow-lg animate-fade-in">
                    <div class="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-500/10"></div>
                    <div class="relative space-y-4">
                        <div class="flex items-start gap-3">
                            <div
                                class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-white" />
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-green-900 dark:text-green-100 mb-1">สร้าง Key สำเร็จ!</h4>
                                <p class="text-sm text-green-700 dark:text-green-300">
                                    คัดลอกและเก็บ API Key นี้ไว้ในที่ปลอดภัย
                                    <strong>ระบบจะแสดงให้เห็นเพียงครั้งเดียวเท่านั้น</strong>
                                </p>
                            </div>
                            <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" size="xs"
                                @click="resultSecret = ''" class="flex-shrink-0" />
                        </div>

                        <div class="relative group">
                            <div
                                class="absolute inset-0 bg-gradient-to-r from-primary-400 to-blue-500 rounded-xl blur opacity-20">
                            </div>
                            <div
                                class="relative flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                                <code
                                    class="flex-1 text-sm font-mono text-gray-700 dark:text-gray-300 break-all select-all">
                                    {{ resultSecret }}
                                </code>
                                <UButton icon="i-heroicons-clipboard-document" color="primary" size="sm"
                                    @click="copyToClipboard(resultSecret)" class="flex-shrink-0 shadow-md">
                                    คัดลอก
                                </UButton>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Create Form -->
                <div class="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <UIcon name="i-heroicons-plus-circle" class="w-4 h-4 text-primary-500" />
                        สร้าง API Key ใหม่
                    </h3>

                    <form @submit.prevent="handleCreateAPI" class="space-y-3">
                        <UInput v-model="form.name" placeholder="ชื่อ API Key (เช่น Production Key, Mobile App...)"
                            icon="i-heroicons-tag" class="w-full" size="lg" :disabled="apiKeysLoading" />

                        <UButton type="submit" block size="lg" :loading="apiKeysLoading" :disabled="!form.name.trim()"
                            class="shadow-lg hover:shadow-xl transition-all duration-300">
                            <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
                            สร้าง API Key
                        </UButton>
                    </form>
                </div>

                <!-- API Keys List -->
                <div>
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <UIcon name="i-heroicons-queue-list" class="w-4 h-4" />
                        รายการ API Keys ({{ apiKeysList.length }})
                    </h3>

                    <!-- Loading State -->
                    <div v-if="apiKeysLoading && apiKeysList.length === 0"
                        class="flex flex-col items-center justify-center py-12">
                        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500 mb-3" />
                        <p class="text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>

                    <!-- Empty State -->
                    <div v-else-if="apiKeysList.length === 0"
                        class="text-center py-12 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <div
                            class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <UIcon name="i-heroicons-key" class="w-8 h-8 text-gray-400" />
                        </div>
                        <p class="text-gray-600 dark:text-gray-400 mb-1 font-medium">ยังไม่มี API Key</p>
                        <p class="text-sm text-gray-500">สร้าง Key เพื่อเริ่มเชื่อมต่อแอปพลิเคชัน</p>
                    </div>

                    <!-- Keys List -->
                    <div v-else class="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        <div v-for="key in apiKeysList" :key="key.name"
                            class="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-lg transition-all duration-300">
                            <div class="flex items-start gap-3">
                                <!-- Icon -->
                                <div
                                    class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0 group-hover:shadow-lg transition-shadow">
                                    <UIcon name="i-heroicons-key" class="w-5 h-5 text-white" />
                                </div>

                                <!-- Content -->
                                <div class="flex-1 min-w-0 space-y-2">
                                    <!-- Name & Date -->
                                    <div>
                                        <h4 class="font-bold text-gray-900 dark:text-white truncate">
                                            {{ key.name }}
                                        </h4>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                            <UIcon name="i-heroicons-calendar" class="w-3 h-3 inline mr-1" />
                                            {{ formatDate(key.created_at) }}
                                        </p>
                                    </div>

                                    <!-- Key Hint -->
                                    <div
                                        class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <code
                                            class="flex-1 text-xs font-mono text-gray-600 dark:text-gray-400 truncate">
                                            {{ key.key_hint }}
                                        </code>
                                        <UButton icon="i-heroicons-clipboard-document" size="2xs" color="gray"
                                            variant="soft" @click="copyToClipboard(key.key_hint)"
                                            class="flex-shrink-0" />
                                    </div>
                                </div>

                                <!-- Delete Button -->
                                <UButton icon="i-heroicons-trash" color="red" variant="soft" size="sm"
                                    @click="confirmDelete(key)" class="flex-shrink-0" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <ModalDelete v-model:open="deleteModal"
        :item="selectedKey ? { id: selectedKey.name, name: selectedKey.name } : null" title="คุณต้องการลบ API Key"
        description="API Key นี้จะถูกยกเลิกทันทีและไม่สามารถใช้งานได้อีก" :delete-handler="handleDeleteKey"
        @deleted="onDeleted" />
</template>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.3s ease-out;
}

/* Custom Scrollbar */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, rgba(156, 163, 175, 0.3), rgba(156, 163, 175, 0.5));
    border-radius: 99px;
    transition: background 0.3s;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, rgba(79, 70, 229, 0.5), rgba(59, 130, 246, 0.7));
}
</style>