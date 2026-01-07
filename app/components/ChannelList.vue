<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { useAuthStore } from '~/stores/auth'

// ========================================
// 1. Setup & Composables
// ========================================
const authStore = useAuthStore()
const {
    fetchMyChannels,
    fetchPublicChannels,
    fetchAllChannels,
    loading
} = useChannel()

const toast = useToast()
const route = useRoute()
const router = useRouter()

// ========================================
// 2. State Management
// ========================================
const channels = ref<any[]>([])

// ดึงค่าจาก URL Query ถ้าไม่มีให้เป็นค่าว่างไว้ก่อน แล้วค่อยกำหนดใน onMounted
const selectedTab = ref((route.query.tab as string) || '')

// ========================================
// 3. Tab Configuration
// ========================================
const items = computed<TabsItem[]>(() => {
    if (!authStore.token) {
        return [{ label: 'แชนแนลสาธารณะ', value: 'public_channels' }]
    }

    const baseTabs = [
        { label: 'แชนแนลของฉัน', value: 'my_channels' },
        { label: 'แชนแนลสาธารณะ', value: 'public_channels' }
    ]

    if (authStore.role === 'admin') {
        baseTabs.push({ label: 'ทั้งหมด (Admin)', value: 'all_channels' })
    }

    return baseTabs
})

const activeLabel = computed(() => {
    return items.value.find(i => i.value === selectedTab.value)?.label || 'แชนแนล'
})

// ========================================
// 4. Load Channels Function
// ========================================
const loadChannels = async () => {
    // ถ้าไม่มี tab ที่เลือก (เช่น เข้ามาครั้งแรก) ไม่ต้องทำอะไร
    if (!selectedTab.value) return

    try {
        let response

        switch (selectedTab.value) {
            case 'my_channels':
                if (!authStore.token) {
                    selectedTab.value = 'public_channels'
                    return
                }
                response = await fetchMyChannels()
                break

            case 'public_channels':
                response = await fetchPublicChannels()
                break

            case 'all_channels':
                if (authStore.role !== 'admin') {
                    toast.add({ title: 'ไม่มีสิทธิ์', color: 'error' })
                    selectedTab.value = 'public_channels'
                    return
                }
                response = await fetchAllChannels()
                break
        }

        // มาตรฐานการรับข้อมูล (Parsing)
        if (Array.isArray(response)) {
            channels.value = response
        } else if ((response as any)?.channels) {
            channels.value = (response as any).channels
        } else if ((response as any)?.data) {
            channels.value = (response as any).data
        } else {
            channels.value = []
        }

    } catch (error: any) {
        toast.add({
            title: 'เกิดข้อผิดพลาด',
            description: error.data?.message || 'ไม่สามารถโหลดข้อมูลได้',
            color: 'error'
        })
        channels.value = []
    }
}

// ========================================
// 5. Watch Tab Changes (Sync URL)
// ========================================
watch(selectedTab, (newTab) => {
    // อัปเดต URL ?tab=... เมื่อมีการเปลี่ยน Tab
    router.replace({
        query: { ...route.query, tab: newTab }
    })
    loadChannels()
})

// ========================================
// 6. Initial Load
// ========================================
onMounted(() => {
    const queryTab = route.query.tab as string

    // ตรวจสอบความถูกต้องของ Tab จาก URL
    const isValidTab = items.value.some(item => item.value === queryTab)

    if (queryTab && isValidTab) {
        selectedTab.value = queryTab
    } else {
        // ค่าเริ่มต้นถ้าไม่มี Query หรือ Query ไม่ถูกต้อง
        selectedTab.value = !authStore.token ? 'public_channels' : 'my_channels'
    }

    // เรียกโหลดข้อมูลครั้งแรก
    loadChannels()
})
</script>

<template>
    <main class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ activeLabel }}
            </h1>

            <UTabs v-model="selectedTab" :items="items" variant="pill" size="md" :content="false"
                class="w-full md:w-auto" />
        </div>

        <div v-if="loading" class="flex justify-center items-center py-20">
            <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
            <span class="ml-3 text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</span>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ChannelCard v-for="channel in channels" :key="channel.channels_id" :item="channel" @load="loadChannels" />

            <div v-if="channels.length === 0" class="col-span-full text-center py-20">
                <UIcon name="i-lucide-folder-open" class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p class="text-xl font-medium text-gray-500 dark:text-gray-400">
                    ไม่พบแชนแนล
                </p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    {{ selectedTab === 'my_channels' ? 'คุณยังไม่มีแชนแนลที่สร้างไว้' : 'ไม่มีรายการในหมวดหมู่นี้' }}
                </p>
            </div>
        </div>
    </main>
</template>