<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

// composables
const { statusChannel } = useChannel()
const authStore = useAuthStore()

// emit
const emit = defineEmits<{ (e: 'load'): void }>()

// props
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

/* =============================== */
/*            Modal State          */
/* =============================== */
const OpenDelete = ref(false)
const OpenEdit = ref(false)
const OpenDetail = ref(false)

const openDelete = () => (OpenDelete.value = true)
const openEdit = () => (OpenEdit.value = true)
const openDetail = () => (OpenDetail.value = true)

/* =============================== */
/*             Card Info           */
/* =============================== */
const cardTitle = computed(() => props.item.title || 'Untitled Channel')
const cardDescription = computed(
    () => props.item.description || 'ยังไม่ได้เขียนคำอธิบายแชนแนล'
)

const cardLink = computed(() => `/channels/${props.item.channels_id}`)
const fileCountLabel = computed(() => `${props.item.file_count ?? 0} ไฟล์`)

const cardCreated_by = computed(() => props.item.created_by_name)
const cardCreated_at = computed(() => {
    if (!props.item.created_at) return 'ไม่ทราบวันที่'
    return new Date(props.item.created_at).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
})

/* =============================== */
/*            Status Badge         */
/* =============================== */
const badgeColor = computed(() => {
    const s = props.item.status
    return s === 'public' ? 'success'
        : s === 'private' ? 'error'
            : s === 'pending' ? 'warning'
                : 'neutral'
})

const badgeLabel = computed(() => {
    const s = props.item.status
    return s === 'public' ? 'Public'
        : s === 'private' ? 'Private'
            : s === 'pending' ? 'Pending'
                : s
})

/* =============================== */
/*       Status Switch (USwitch)   */
/* =============================== */
// ... (ส่วนประกาศ ref เดิม)
const isPublic = ref(props.item.status === 'public')
const statusLoading = ref(false)

// ✅ 1. เพิ่ม Watcher นี้ เพื่อให้ Switch เปลี่ยนค่าตาม Props เสมอ
watch(() => props.item.status, (newStatus) => {
    const isNewStatusPublic = newStatus === 'public'
    // เช็คว่าค่าต่างกันค่อยอัปเดต เพื่อไม่ให้ไปกระตุ้น watcher ตัวล่างทำงานซ้ำซ้อน
    if (isPublic.value !== isNewStatusPublic) {
        isPublic.value = isNewStatusPublic
    }
})

// ✅ 2. ปรับปรุง Watcher เดิมเล็กน้อย
watch(isPublic, async (val, oldVal) => {
    // ถ้ากำลังโหลดอยู่ ห้ามทำอะไร
    if (statusLoading.value) return

    // ⚡ เช็คสำคัญ: ถ้าค่าที่ User กด มันตรงกับค่าใน Database (Props) อยู่แล้ว
    // แปลว่า User ไม่ได้กด หรือเป็นการอัปเดตมาจาก Watcher ข้างบน -> ให้จบการทำงาน ไม่ต้องยิง API
    const currentPropIsPublic = props.item.status === 'public'
    if (val === currentPropIsPublic) return

    statusLoading.value = true

    try {
        await statusChannel(props.item.channels_id, {
            approve: val,
            reason: ""
        })
        emit('load')
    } catch (err) {
        console.error(err)
        // Rollback: ถ้า Error ดีด Switch กลับ
        isPublic.value = oldVal
    } finally {
        statusLoading.value = false
    }
})

/* =============================== */
/*            Dropdown Menu        */
/* =============================== */
const items: DropdownMenuItem[][] = [
    [
        {
            label: 'Detail',
            icon: 'i-lucide-eye',
            class: "cursor-pointer",
            onSelect: () => openDetail()
        },
        {
            label: 'Edit',
            icon: 'i-lucide-pencil',
            class: "cursor-pointer",
            onSelect: () => openEdit()
        }
    ],

    authStore.role === 'admin'
        ? [
            {
                slot: 'status-switch',
                onSelect: (e: Event) => e.preventDefault()
            },
            {
                label: 'Delete',
                icon: 'i-lucide-trash',
                class: "cursor-pointer",
                color: 'error',
                onSelect: () => openDelete()
            }
        ]
        : [
            {
                label: 'ส่งคำขอเป็นสาธารณะ',
                icon: 'i-lucide-cloud',
                class: "cursor-pointer",
            }
        ],

    [
        {
            label: 'Delete',
            icon: 'i-lucide-trash',
            class: "cursor-pointer",
            color: 'error',
            onSelect: () => openDelete()
        }
    ]
]

/* =============================== */
/*            Testimonial          */
/* =============================== */
const testimonial = ref({
    user: {
        name: cardCreated_by,
        description: cardCreated_at,
        avatar: {
            src: 'https://avatars.githubusercontent.com/u/0?v=4',
            alt: 'User avatar'
        }
    }
})
</script>

<template>
    <div class="w-full max-w-md mx-auto relative">

        <!-- Card -->
        <UPageCard :title="cardTitle" :description="cardDescription" :to="cardLink" variant="subtle"
            class="w-full cursor-pointer">
            <template #footer>
                <div class="pb-3 flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2">
                        <UBadge :color="badgeColor" size="md" variant="subtle">
                            {{ badgeLabel }}
                        </UBadge>
                        <span class="text-gray-500 dark:text-gray-400">{{ fileCountLabel }}</span>
                    </div>
                </div>

                <UUser v-bind="testimonial.user" />
            </template>
        </UPageCard>

        <!-- Dropdown -->
        <div class="absolute top-2 right-2 z-10">
            <UDropdownMenu :items="items" :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
                :ui="{ content: 'w-48' }">
                <UButton variant="ghost" icon="i-lucide-more-vertical" aria-label="More actions"
                    class="p-1 cursor-pointer" />

                <!-- Switch Slot -->
                <template #status-switch>
                    <div class="flex items-center justify-between w-full" @click.stop>
                        <div class="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                            <UIcon name="i-lucide-globe" class="w-4 h-4 text-gray-500" />
                            <span class="truncate">Public Access</span>
                        </div>

                        <USwitch v-model="isPublic" :disabled="statusLoading" />
                    </div>
                </template>
            </UDropdownMenu>
        </div>
    </div>

    <!-- Modals -->
    <ModalDelete v-model:open="OpenDelete" :item="{ channels_id: props.item.channels_id, title: props.item.title }"
        @deleted="emit('load')" />

    <ModalEdit v-model:open="OpenEdit" :item="{
        channels_id: props.item.channels_id,
        title: props.item.title,
        description: props.item.description
    }" @edit="emit('load')" />

    <ModalDetail v-model:open="OpenDetail" :item="props.item" @edit="emit('load')" />
</template>
