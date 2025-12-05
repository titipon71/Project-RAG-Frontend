<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

// ตรวจสอบให้แน่ใจว่า import ref มาด้วย เนื่องจากมีการใช้งาน
import { ref } from 'vue'

const items: DropdownMenuItem[][] = [
    [
        {
            label: 'View',
            icon: 'i-lucide-eye',
            class: 'cursor-pointer'
        },
        {
            label: 'Edit',
            icon: 'i-lucide-pencil',
            class: 'cursor-pointer'
        }
    ],
    [
        {
            label: 'Delete',
            color: 'error',
            icon: 'i-lucide-trash',
            class: 'cursor-pointer'
        }
    ]
]

const testimonial = ref({
    user: {
        name: 'Evan You',
        description: 'Author of Vue.js and Vite',
        avatar: {
            src: 'https://avatars.githubusercontent.com/u/499550?v=4',
            alt: 'Evan You'
        }
    },
    quote: '“Nuxt on Cloudflare infra with minimal effort - this is huge!”'
})
</script>

<template>
    <div class="w-full max-w-md mx-auto relative">
        <UPageCard title="Tailwind CSS"
            description="Nuxt UI integrates with latest Tailwind CSS v4, bringing significant improvements."
            to="channels/[id]" variant="subtle" class="w-full">
            <template #footer>
                <div class="pb-3 flex items-center justify-between">
                    <UBadge size="md" variant="subtle">Published</UBadge>
                </div>
                <UUser v-bind="testimonial.user" />
            </template>
        </UPageCard>

        <div class="absolute top-2 right-2 z-10">
            <UDropdownMenu :items="items" :content="{
                align: 'end',
                side: 'bottom',
                sideOffset: 8
            }" :ui="{ content: 'w-48' }">
                <UButton variant="ghost" icon="i-lucide-more-vertical" aria-label="More actions"
                    class="p-1 cursor-pointer" />
            </UDropdownMenu>
        </div>
    </div>
</template>