<script setup lang="ts">
import { ref, onMounted } from 'vue'
const { fetchChannels, loading } = useChannel()

definePageMeta({
    middleware: 'auth'
})

const channels = ref<any[]>([])
const errorMsg = ref('')

const loadChannels = async () => {
    errorMsg.value = ''

    try {
        const data = await fetchChannels()
        channels.value = Array.isArray(data) ? data : []
    } catch (e) {
        console.error(e)
        errorMsg.value = 'โหลดข้อมูลแชนแนลไม่สำเร็จ'
    }
}

onMounted(() => {
    loadChannels()
})
</script>


<template>
    <nav class="flex items-center justify-between py-4">
        <NuxtLink to="/" class="text-xl">จัดการห้องแชนแนล</NuxtLink>
        <div class="flex items-center gap-3">
            <ModalCreate>
                <UButton class="cursor-pointer" size="lg" label="สร้างแชนแนลใหม่" color="secondary" variant="solid" />
            </ModalCreate>

            <UserMenu />
        </div>
    </nav>

    <USeparator size="md" />

    <main class="mt-6">
        <!-- 1) กำลังโหลด -->
        <div v-if="loading"
            class="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center py-20 rounded-lg">
            <UIcon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-gray-400" />
            <p class="text-gray-500">กำลังโหลดห้องแชนแนล...</p>
        </div>

        <!-- 2) ถ้าไม่มี channel -->
        <div v-else-if="!channels.length"
            class="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center bg-blue-50 dark:bg-gray-800 py-20 rounded-lg">
            <UIcon name="i-lucide-archive-x" class="w-16 h-16 text-gray-400" />
            <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                เริ่มต้นการสร้างห้องแชนแนล
            </h2>
            <p class="text-gray-500 max-w-md">
                เหมือนคุณจะยังไม่เคยสร้างแชนแนล โปรดสร้างแชนแนลแรกของคุณก่อน
            </p>

            <ModalCreate>
                <UButton class="cursor-pointer" label="สร้างแชนแนลใหม่" color="secondary" variant="solid" />
            </ModalCreate>
        </div>

        <!-- 3) ถ้ามี channel ให้แสดง -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
            <!-- การ์ดสร้างแชนแนลใหม่ -->
            <ModalCreate>
                <button type="button" class="w-full h-full min-h-[190px] bg-white border border-gray-200
               dark:bg-gray-800 dark:border-gray-800 rounded-lg flex flex-col
               items-center justify-center cursor-pointer hover:shadow-md
               hover:border-blue-300 transition-all group">
                    <div class="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3
                 group-hover:scale-110 transition-transform">
                        <UIcon name="i-heroicons-plus" class="w-7 h-7 text-blue-600" />
                    </div>

                    <span class="text-lg font-medium text-black-700 group-hover:text-blue-600 transition-colors">
                        สร้างแชนแนลใหม่
                    </span>
                </button>
            </ModalCreate>

            <!-- Loop แชนแนล -->
            <div v-for="ch in channels" :key="ch.channels_id" class="w-full">
                <BlogPostCard :item="{
                    channels_id: ch.channels_id,
                    title: ch.title,
                    description: ch.description,
                    status: ch.status,
                    created_by_name: ch.created_by_name,
                    created_at: ch.created_at,
                    file_count: ch.file_count
                }" @deleted="loadChannels" />
            </div>
        </div>
    </main>

</template>
