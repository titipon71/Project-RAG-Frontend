<script setup lang="ts">

definePageMeta({
    middleware: 'auth' // บังคับว่าต้องล็อกอินก่อน
})

const value = ref(0)

const allChannels = [
    { id: 1, title: 'ห้องนั่งเล่นทั่วไป', type: 'general', isMine: false },
    { id: 2, title: 'รวมเทคนิค Nuxt.js', type: 'recommended', isMine: true },
    { id: 3, title: 'ถาม-ตอบ ปัญหาโค้ด', type: 'general', isMine: false },
    { id: 4, title: 'Vue.js Update', type: 'recommended', isMine: false },
    { id: 5, title: 'Project ส่วนตัวของฉัน', type: 'general', isMine: true },
]

for (const key in allChannels) {
    value.value += 1
}

</script>

<template>
    <nav class="flex items-center justify-between py-4">
        <NuxtLink to="/" class="text-xl">จัดการห้องแชนแนล</NuxtLink>
        <div class="flex items-center">
            <ModalMenu>
                <UButton class="cursor-pointer" size="lg" label="สร้างแชนแนลใหม่" color="secondary" variant="solid" />
            </ModalMenu>

            <UserMenu />
        </div>
    </nav>

    <USeparator size="md" />

    <main>

        <div v-if="value === 0"
            class="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center bg-blue-50 dark:bg-gray-800 py-20 rounded-lg mt-10">
            <UIcon name="i-lucide-archive-x" class="w-16 h-16 text-gray-400" />
            <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">เริ่มต้นการสร้างห้องแชนแนล</h2>
            <p class="text-gray-500 max-w-md">
                เหมือนคุณจะยังไม่เคยสร้างแขนแนลโปรสร้างก่อน
            </p>

            <ModalMenu>
                <UButton class="cursor-pointer" label="สร้างแชนแนลใหม่" color="secondary" variant="solid" />
            </ModalMenu>
        </div>

        <div v-else class="grid grid-cols-4 gap-4 my-6">
            <ModalMenu>
                <button type="button" class="w-full h-full min-h-[200px] bg-white border border-gray-200
             dark:bg-gray-800 dark:border-gray-800 rounded-2xl flex flex-col
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
            </ModalMenu>

            <div v-for="channel in allChannels" :key="channel.id">
                <BlogPostCard :item="channel" />
            </div>

        </div>
    </main>
</template>