<script setup lang="ts">
/* ============================================
   COMPOSABLES & STORES
============================================ */
const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const { fetchPublicChannels } = useChannel()
const { uploadFiles, clearError } = useFileChannel() // เก็บแค่ uploadFiles กับ clearError

const loading = ref(false)
const error = ref('')
/* ============================================
   COMPUTED PROPERTIES
============================================ */
const channelId = computed(() => route.params.id as string)

// ✅ ใช้ fileCount จาก state โดยตรง หรือถ้ามี sources ให้นับจาก sources
const displayFileCount = computed(() =>
    state.sources.length > 0 ? state.sources.length : state.fileCount
)

/* ============================================
   STATE MANAGEMENT
============================================ */
const state = reactive({
    // Modal states
    isModalOpen: false,
    isUploading: false,

    // ✅ เพิ่ม channelTitle เพื่อเก็บชื่อช่อง
    channelTitle: '',

    // ✅ เปลี่ยนชื่อตัวแปรให้ชัดเจน
    fileCount: 0,  // เก็บจำนวนไฟล์จาก API
    sources: [] as any[],  // เก็บรายการไฟล์
})

const deleteModalState = reactive({
    isOpen: false,
    selectedFile: null as any
})

/* ============================================
   DATA LOADING FUNCTIONS
============================================ */
async function loadChannelFiles() {
    loading.value = true
    error.value = ''

    try {
        // ✅ เรียก fetchPublicChannels พร้อมกรองเฉพาะช่องที่ต้องการ
        const response = await fetchPublicChannels({
            limit: 100  // ดึงมาเยอะๆ เผื่อหาช่องที่เราต้องการ
        })

        // ✅ หาช่องที่ตรงกับ channelId
        const currentChannel = response.find((ch: any) =>
            ch.channels_id === channelId.value ||
            ch.channel_id === channelId.value  // ลองทั้ง 2 field เผื่อ API ใช้ชื่อต่างกัน
        )

        if (currentChannel) {
            // ✅ เซ็ตข้อมูลจาก response
            state.channelTitle = currentChannel.title
            state.fileCount = currentChannel.file_count || 0
            state.sources = currentChannel.files || []

            console.log('✅ โหลดข้อมูลช่องสำเร็จ:', {
                title: state.channelTitle,
                fileCount: state.fileCount,
                filesLoaded: state.sources.length
            })
        } else {
            throw new Error('ไม่พบช่องที่ต้องการ')
        }

    } catch (err) {
        console.error('❌ Error loading channel:', err)
        error.value = 'ไม่สามารถโหลดข้อมูลช่องได้'

        toast.add({
            title: 'เกิดข้อผิดพลาด',
            description: 'ไม่สามารถโหลดรายการไฟล์ได้',
            color: 'error'
        })
    } finally {
        loading.value = false
    }
}

/* ============================================
   FILE UPLOAD HANDLERS
============================================ */
async function handleFileUpload(event: any) {
    const files = event.target?.files || event.dataTransfer?.files || event
    if (!files || files.length === 0) return

    const fileArray = Array.from(files) as File[]

    // Validate file count (max 50 files)
    if (state.sources.length + fileArray.length > 50) {
        toast.add({
            title: 'เกิดข้อผิดพลาด',
            description: 'ไม่สามารถอัปโหลดได้เกิน 50 ไฟล์',
            color: 'error'
        })
        return
    }

    // Validate file size (max 50MB per file)
    const invalidFiles = fileArray.filter(f => f.size > 50 * 1024 * 1024)
    if (invalidFiles.length > 0) {
        toast.add({
            title: 'ไฟล์ใหญ่เกินไป',
            description: `${invalidFiles[0]?.name} มีขนาดเกิน 50MB`,
            color: 'error'
        })
        return
    }

    // Upload files
    try {
        state.isUploading = true
        const result = await uploadFiles(channelId.value, fileArray)

        state.sources.push(...result.files)
        state.isModalOpen = false

        toast.add({
            title: 'สำเร็จ',
            description: `อัปโหลดไฟล์ ${fileArray.length} ไฟล์เรียบร้อย`,
            color: 'success'
        })
    } catch (err) {
        console.error('Upload failed:', err)
        toast.add({
            title: 'เกิดข้อผิดพลาด',
            description: error.value || 'ไม่สามารถอัปโหลดไฟล์ได้',
            color: 'error'
        })
    } finally {
        state.isUploading = false
    }
}

function openDeleteModal(file: any) {
    deleteModalState.selectedFile = file
    deleteModalState.isOpen = true
}

function handleFileDeleted(fileId: string) {
    state.sources = state.sources.filter(f => f.files_id !== fileId)
}


/* ============================================
   LIFECYCLE HOOKS
============================================ */
onMounted(async () => {
    await Promise.all([
        loadChannelFiles()
    ])
})

watch(() => route.params.id, (newId) => {
    if (newId) {
        loadChannelFiles()
    }
})
</script>

<template>
    <aside
        class="w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col hidden md:flex shadow-xl">

        <!-- Sidebar Header -->
        <div
            class="p-6 border-b border-gray-100 dark:border-gray-800/50 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-950/20">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                <h2 class="font-bold text-gray-800 dark:text-gray-100 text-lg">แหล่งข้อมูล</h2>
            </div>

            <!-- Add Source Button -->
            <UModal v-model="state.isModalOpen" :ui="{ content: 'sm:max-w-[900px]', overlay: 'backdrop-blur-sm' }">
                <UButton block icon="i-heroicons-plus" color="primary" size="lg"
                    :disabled="loading || state.isUploading"
                    class="cursor-pointer font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <span class="flex items-center gap-2">
                        <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
                        เพิ่มแหล่งที่มา
                    </span>
                </UButton>

                <!-- Upload Modal -->
                <template #header>
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                            <UIcon name="i-heroicons-document-plus" class="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">เพิ่มแหล่งที่มา</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">อัปโหลดเอกสารเพื่อให้ AI
                                วิเคราะห์ข้อมูล</p>
                        </div>
                    </div>
                </template>

                <template #body>
                    <div class="p-6 space-y-6">
                        <!-- Upload Zone -->
                        <div class="relative group">
                            <div
                                class="border-3 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl h-64 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900/50 hover:from-primary-50 hover:to-blue-50 dark:hover:from-primary-950/20 dark:hover:to-blue-950/20 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300 cursor-pointer group-hover:shadow-2xl group-hover:scale-[1.01]">

                                <!-- Default State -->
                                <div v-if="!state.isUploading"
                                    class="flex flex-col items-center text-center space-y-4 pointer-events-none">
                                    <div
                                        class="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <UIcon name="i-heroicons-cloud-arrow-up" class="w-8 h-8" />
                                    </div>
                                    <h4 class="text-xl font-bold text-gray-800 dark:text-gray-100">
                                        อัปโหลดแหล่งข้อมูล</h4>
                                    <p class="text-gray-600 dark:text-gray-300 text-base">
                                        ลากและวาง หรือ <span
                                            class="text-primary-600 dark:text-primary-400 font-semibold">คลิกเพื่อเลือกไฟล์</span>
                                    </p>
                                    <div class="flex items-center gap-4 text-sm text-gray-500">
                                        <div class="flex items-center gap-1.5">
                                            <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                                            <span>PDF, TEXT</span>
                                        </div>
                                        <div class="w-1 h-1 rounded-full bg-gray-400"></div>
                                        <div class="flex items-center gap-1.5">
                                            <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4" />
                                            <span>สูงสุด 50MB</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Loading State -->
                                <div v-else class="flex flex-col items-center gap-4">
                                    <div class="relative">
                                        <div
                                            class="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 rounded-full">
                                        </div>
                                        <div
                                            class="w-16 h-16 border-4 border-primary-600 rounded-full border-t-transparent animate-spin absolute inset-0">
                                        </div>
                                    </div>
                                    <p class="text-gray-700 dark:text-gray-200 font-medium text-lg">กำลังอัปโหลด...
                                    </p>
                                </div>

                                <!-- File Input -->
                                <input type="file" multiple accept=".pdf,.txt"
                                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    :disabled="state.isUploading" @change="handleFileUpload" />
                            </div>
                        </div>

                        <!-- Error Display -->
                        <UAlert v-if="error" color="error" variant="soft" :title="error"
                            :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'error', variant: 'link' }"
                            @close="clearError" />
                    </div>

                    <!-- Progress Footer -->
                    <div
                        class="p-6 bg-gradient-to-br from-gray-50 to-transparent dark:from-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                        <div class="flex items-center gap-4">
                            <UIcon name="i-heroicons-folder" class="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div class="flex-1">
                                <div class="flex items-center justify-between mb-2">
                                    <span
                                        class="text-sm font-semibold text-gray-700 dark:text-gray-200">ขีดจำกัดแหล่งที่มา</span>
                                    <span class="text-sm font-bold text-primary-600 dark:text-primary-400">{{
                                        displayFileCount }}/50</span>
                                </div>
                                <UProgress :model-value="displayFileCount" :max="50" size="md" />
                            </div>
                        </div>
                    </div>
                </template>
            </UModal>
        </div>

        <!-- File List -->
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
            <!-- Loading State -->
            <div v-if="loading && state.sources.length === 0" class="flex items-center justify-center h-32">
                <div class="relative">
                    <div class="w-10 h-10 border-3 border-primary-200 dark:border-primary-900 rounded-full"></div>
                    <div
                        class="w-10 h-10 border-3 border-primary-600 rounded-full border-t-transparent animate-spin absolute inset-0">
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="state.sources.length === 0"
                class="flex flex-col items-center justify-center h-48 text-center px-4 py-8 rounded-2xl bg-gradient-to-br from-gray-100/50 to-transparent dark:from-gray-800/30">
                <div
                    class="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-3">
                    <UIcon name="i-heroicons-document" class="w-8 h-8 text-gray-400" />
                </div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">ยังไม่มีไฟล์</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">เริ่มเพิ่มแหล่งข้อมูลของคุณ</p>
            </div>

            <!-- File Items -->
            <div v-for="(file, index) in state.sources" :key="file.files_id"
                class="flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent dark:hover:from-primary-950/30 cursor-pointer group transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-transparent hover:border-primary-200 dark:hover:border-primary-900"
                :style="{ animationDelay: `${index * 50}ms` }">

                <div class="flex items-center gap-3 truncate flex-1 min-w-0">
                    <div
                        class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <UIcon name="i-heroicons-document-text"
                            class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate block"
                            :title="file.original_filename">
                            {{ file.original_filename }}
                        </span>
                        <span class="text-xs text-gray-400 dark:text-gray-500">
                            {{ (file.size_bytes / 1024).toFixed(1) }} KB
                        </span>
                    </div>
                </div>

                <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm"
                    @click.stop="openDeleteModal(file)"
                    class="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110" />
            </div>
        </div>

        <!-- Sidebar Footer -->
        <div
            class="p-4 bg-gradient-to-t from-gray-100/50 to-transparent dark:from-gray-900/50 border-t border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm">
            <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">ใช้งานแล้ว</span>
                        <span class="text-sm font-bold text-primary-600 dark:text-primary-400">{{ displayFileCount
                            }}/50</span>
                    </div>
                    <UProgress :model-value="displayFileCount" :max="50" size="md" />
                </div>
            </div>
        </div>
    </aside>

    <!-- Delete Modal Component -->
    <ModalDeleteFile v-model:open="deleteModalState.isOpen" :file="deleteModalState.selectedFile"
        @deleted="handleFileDeleted" />
</template>