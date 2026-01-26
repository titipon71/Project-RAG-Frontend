<script setup lang="ts">
/* ============================================
   Imports & Composables
============================================ */
const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const { fetchPublicChannels, fetchMyChannels, fetchAllChannels } = useChannel()

/* ============================================
   Computed Properties
============================================ */
const channelId = computed(() => route.params.id as string)

const fileCount = computed(() => {
    return channelState.sources.length > 0
        ? channelState.sources.length
        : (channelState.totalFilesFromList || 0)
})

/* ============================================
   State Management
============================================ */
const channelState = reactive({
    channelTitle: '',
    sources: [] as any[],
    totalFilesFromList: 0,
    loading: true, // เริ่มต้นเป็น true เพื่อแสดง loading state
    isInitialized: false // เช็คว่าโหลดข้อมูลครั้งแรกเสร็จแล้วหรือยัง
})

/* ============================================
   Data Loading
============================================ */
const loadChannelData = async () => {
    if (!channelId.value) return

    try {
        channelState.loading = true
        let response

        // ตรวจสอบสิทธิ์ (Admin > Owner > Public)
        if (authStore.role === 'admin') {
            response = await fetchAllChannels({ limit: 100 })
        } else if (authStore.token) {
            response = await fetchMyChannels({ limit: 100 })
        }

        // ฟังก์ชันหาช่องที่ ID ตรงกัน
        const findChannel = (list: any[]) =>
            list?.find((c: any) => String(c.channels_id) === String(channelId.value))

        let currentChannel = response ? findChannel(response as any[]) : null

        // ถ้าไม่เจอให้ดึงจาก Public
        if (!currentChannel) {
            const publicRes = await fetchPublicChannels({ limit: 100 })
            currentChannel = findChannel(publicRes as any[])
        }

        // อัปเดตข้อมูล
        if (currentChannel) {
            channelState.channelTitle = currentChannel.title || 'ไม่พบชื่อช่อง'
            channelState.totalFilesFromList = currentChannel.file_count || 0
            channelState.sources = currentChannel.files || []
        } else {
            toast.add({
                title: 'ไม่พบข้อมูลช่อง',
                description: 'คุณไม่มีสิทธิ์เข้าถึงช่องนี้',
                color: 'warning'
            })
            router.push('/')
        }
    } catch (err: any) {
        toast.add({
            title: 'เกิดข้อผิดพลาด',
            description: 'ไม่สามารถโหลดข้อมูลช่องได้',
            color: 'error'
        })
    } finally {
        channelState.loading = false
        channelState.isInitialized = true
    }
}

/* ============================================
   Event Handlers from Child Components
============================================ */
const handleSourcesUpdate = (newSources: any[]) => {
    channelState.sources = newSources
}

/* ============================================
   Lifecycle Hooks
============================================ */
onMounted(() => {
    loadChannelData()
})

watch(() => route.params.id, (newId) => {
    if (newId) {
        loadChannelData()
    }
})
</script>

<template>
    <div
        class="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">

        <!-- Loading Skeleton (แสดงตอน refresh หน้าใหม่) -->
        <template v-if="!channelState.isInitialized">
            <!-- Sidebar Skeleton -->
            <aside
                class="w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col hidden md:flex shadow-xl">
                <div class="p-6 border-b border-gray-100 dark:border-gray-800/50">
                    <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                    <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div class="flex-1 p-3 space-y-2">
                    <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse">
                    </div>
                </div>
            </aside>

            <!-- Main Content Skeleton -->
            <main class="flex-1 flex flex-col">
                <div
                    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-6 py-5 border-b border-gray-200/50 dark:border-gray-800/50">
                    <div class="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div class="flex-1 flex items-center justify-center">
                    <div class="text-center space-y-4">
                        <div class="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 rounded-full mx-auto">
                        </div>
                        <div class="w-16 h-16 border-4 border-primary-600 rounded-full border-t-transparent animate-spin absolute inset-0 mx-auto"
                            style="margin-top: -4rem;"></div>
                        <p class="text-gray-500 mt-16">กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </main>
        </template>

        <!-- Main Content (แสดงเมื่อโหลดเสร็จแล้ว) -->
        <template v-else>
            <!-- Sidebar Component -->
            <Sidebar :channel-id="channelId" :sources="channelState.sources"
                :total-files="channelState.totalFilesFromList" :loading="channelState.loading"
                @update:sources="handleSourcesUpdate" />

            <!-- Main Content Component -->
            <MainContent :channel-id="channelId" :channel-title="channelState.channelTitle" :file-count="fileCount" />
        </template>
    </div>
</template>