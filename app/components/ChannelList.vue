<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import { onMounted, nextTick } from 'vue'

// 1. Mock Data (ข้อมูล)
const allChannels = ref([
    { id: 1, title: 'ห้องนั่งเล่นทั่วไป', type: 'general', isMine: false },
    { id: 2, title: 'รวมเทคนิค Nuxt.js', type: 'recommended', isMine: true },
    { id: 3, title: 'ถาม-ตอบ ปัญหาโค้ด', type: 'general', isMine: false },
    { id: 4, title: 'Vue.js Update', type: 'recommended', isMine: false },
    { id: 5, title: 'Project ส่วนตัวของฉัน', type: 'general', isMine: true },
])

const items = ref([
    { label: 'แชนแนลของฉัน', value: 'my_channels' },
    { label: 'แชนแนลสาธารณะ', value: 'recommended' },
    { label: 'ทั้งหมด', value: 'all' }
])

const selectedTab = ref('my_channels')

const activeLabel = computed(() => {
    return items.value.find(i => i.value === selectedTab.value)?.label
})

const filteredChannels = computed(() => {
    const currentKey = selectedTab.value ?? 'all'

    if (currentKey === 'all') return allChannels.value
    else if (currentKey === 'my_channels') return allChannels.value.filter(item => item.isMine)
    else return allChannels.value.filter(item => item.type === currentKey)
})

</script>

<template>
    <main>
        <div class="flex items-center justify-between my-6">
            <h1 class="text-2xl font-semibold">{{ activeLabel }}</h1>

            <UTabs v-model="selectedTab" :items="items" variant="pill" size="md" :content="false" />
        </div>

        <div class="grid grid-cols-4 gap-4 my-6">
            <div v-for="channel in filteredChannels" :key="channel.id">
                <BlogPostCard :item="channel" />
            </div>
            <div v-if="filteredChannels.length === 0" class="col-span-4 text-center py-10 text-gray-400">
                ไม่มีข้อมูล
            </div>
        </div>
    </main>
</template>