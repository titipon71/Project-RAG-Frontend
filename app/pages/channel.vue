<script setup lang="ts">

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
        <div class="flex items-center gap-4">
            <ModalMenu />

            <UserMenu />
        </div>
    </nav>

    <USeparator size="md" />

    <main>

        <div v-if="value === 0"
            class="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center bg-blue-50 dark:bg-gray-800 py-20 rounded-lg mt-10">
            <UIcon name="i-lucide-archive-x" class="w-16 h-16 text-gray-400" />
            <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">เริ่มต้นการสนทนา</h2>
            <p class="text-gray-500 max-w-md">
                เพิ่มแหล่งข้อมูลของคุณแล้วถามคำถามเกี่ยวกับเอกสารเหล่านั้นได้เลย AI ของเราพร้อมช่วยเหลือคุณ
            </p>
            <ModalMenu />
        </div>

        <div v-else class="grid grid-cols-4 gap-4 my-6">
            <ModalCreateChannel />

            <div v-for="channel in allChannels" :key="channel.id">
                <BlogPostCard :item="channel" />
            </div>

        </div>
    </main>
</template>