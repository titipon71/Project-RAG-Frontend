<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { ref, computed } from 'vue'

const emit = defineEmits<{
    (e: 'load'): void
}>()

const props = defineProps<{
    item: {
        channels_id: number
        title: string
        description?: string | null
        status?: string | null
        created_by_name: string
        created_at?: string | null
        file_count?: number | null
    }
}>()

// ====== state ไว้เปิด/ปิด ModalDelete ======
const OpenModal = ref(false)
const OpenEdit = ref(false)
const openDelete = () => {
    OpenModal.value = true
}
const openEdit = () => {
    OpenEdit.value = true
}

// ====== ข้อมูลโชว์บนการ์ด ======
const cardCreated_by = computed(() => `${props.item.created_by_name}`)
const cardCreated_at = computed(() => {
    if (!props.item.created_at) return 'ไม่ทราบวันที่'

    const date = new Date(props.item.created_at)

    return date.toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
})

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
            class: 'cursor-pointer',
            onSelect: () => {
                openEdit()
            }
        }
    ],
    [
        {
            label: 'Delete',
            color: 'error',
            icon: 'i-lucide-trash',
            class: 'cursor-pointer',
            onSelect: () => {
                openDelete()
            }
        }
    ]
]

const testimonial = ref({
    user: {
        name: cardCreated_by || 'Unknown',
        description: cardCreated_at,
        avatar: {
            src: 'https://avatars.githubusercontent.com/u/0?v=4',
            alt: 'User avatar'
        }
    },
    quote: '“Channel ready to use.”'
})

const cardLink = computed(() => `/channels/${props.item.channels_id}`)
const cardTitle = computed(() => props.item.title || 'Untitled Channel')
const cardDescription = computed(
    () => props.item.description || 'ยังไม่ได้เขียนคำอธิบายแชนแนล'
)

const badgeLabel = computed(() => {
    if (!props.item.status) return 'Unknown'
    if (props.item.status === 'public') return 'Public'
    if (props.item.status === 'private') return 'Private'
    return props.item.status
})

const fileCountLabel = computed(() => {
    const file = props.item.file_count ?? 0
    return `${file} ไฟล์`
})
</script>

<template>
    <div class="w-full max-w-md mx-auto relative">
        <UPageCard :title="cardTitle" :description="cardDescription" :to="cardLink" variant="subtle"
            class="w-full cursor-pointer">
            <template #footer>
                <div class="pb-3 flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2">
                        <UBadge size="md" variant="subtle">
                            {{ badgeLabel }}
                        </UBadge>
                        <span class="text-gray-500 dark:text-gray-400">
                            {{ fileCountLabel }}
                        </span>
                    </div>
                </div>
                <UUser v-bind="testimonial.user" />
            </template>
        </UPageCard>

        <!-- ปุ่ม 3 จุด -->
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

        <ModalDelete v-model:open="OpenModal" :item="{ channels_id: props.item.channels_id, title: props.item.title }"
            @deleted="emit('load')" />

        <ModalEdit v-model:open="OpenEdit" :item="{
            channels_id: props.item.channels_id,
            title: props.item.title,
            description: props.item.description
        }" @edit="emit('load')" />


    </div>
</template>