<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const items = ref<DropdownMenuItem[][]>([
    [
        {
            label: 'หน้าหลัก',
            icon: 'i-lucide-house',
            to: '/'
        },
        {
            label: 'สร้างแชนแนลใหม่',
            icon: 'i-lucide-book-plus',
            to: '/channel'
        }
    ],
    [
        {
            label: 'ออกจากระบบ',
            icon: 'i-lucide-log-out',
            class: 'cursor-pointer',
            color: 'error',
            action: () => {
                // Logic ออกจากระบบ
            }
        }
    ]
])

</script>

<template>
    <div class="flex items-center gap-4">
        <!-- 
        <ClientOnly>
            <UContentSearchButton :collapsed="false" :kbds="['alt', 'O']" />

            <LazyUContentSearch v-model:search-term="searchTerm" shortcut="alt_o" :files="files"
                :navigation="navigation" :fuse="{ resultLimit: 42 }" />
        </ClientOnly> -->

        <UPopover arrow :popper="{ placement: 'bottom-end' }">
            <UChip text="5" color="error" size="3xl" inset>
                <UButton class="cursor-pointer" icon="i-lucide-bell" color="neutral" variant="ghost" />
            </UChip>

            <template #content>
                <div
                    class="flex flex-col w-80 sm:w-96 bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">

                    <div
                        class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 class="font-semibold text-gray-900 dark:text-white text-sm">
                            Notifications
                        </h3>
                        <span v-if="true" class="text-xs text-gray-500 cursor-pointer hover:text-primary">Clear
                            all</span>
                    </div>

                    <div class="flex flex-col">
                        <UEmpty v-if="true" icon="i-lucide-bell-off" title="No notifications"
                            description="You're all caught up!" class="py-8" />

                        <div v-else class="max-h-[320px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">

                            <div
                                class="group px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors relative">
                                <div class="flex gap-3">
                                    <div class="mt-1">
                                        <div class="size-2 rounded-full bg-blue-500"></div>
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-gray-900 dark:text-white">New Comment</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                            Somchai commented on your post "Vue.js Tips".
                                        </p>
                                        <p class="text-[10px] text-gray-400 mt-1">2 mins ago</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </template>
        </UPopover>

        <UColorModeButton class="cursor-pointer" />

        <UButton v-if="false" label="เข้าสู่ระบบ" to="/login" color="info" icon="i-lucide-log-in" />

        <UDropdownMenu v-else :items="items" :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
            :ui="{ content: 'w-48' }">
            <UUser name="John Doe" description="Software Engineer"
                :avatar="{ src: 'https://i.pravatar.cc/150?u=john-doe' }" chip size="sm"
                class="cursor-pointer transition-opacity hover:opacity-80 text-left" />
        </UDropdownMenu>

    </div>
</template>
