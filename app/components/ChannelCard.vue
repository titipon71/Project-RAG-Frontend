<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Composables
const {
    statusChannel,
    requestPublicChannel,
    cancelRequestPublicChannel,
    ownerSetPrivateChannel,
    adminforceSetPrivateChannel,
    adminforceSetPublicChannel,
    loading // ใช้ loading ตัวรวมที่ประกาศไว้ใน useChannel ตัวใหม่
} = useChannel()

const authStore = useAuthStore()
const toast = useToast()

// Emit & Props
const emit = defineEmits<{ (e: 'load'): void }>()

const props = defineProps<{
    item: {
        channels_id: number
        title: string
        description?: string | null
        status?: string | null
        created_by_name: string
        created_by_id: number
        created_at?: string | null
        file_count?: number | null
    }
}>()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const isAdmin = computed(() => authStore.role === 'admin')

const isOwner = computed(() => {
    if (!authStore.user) return false
    return authStore.user.users_id === props.item.created_by_id
})

const isPublicChannel = computed(() => props.item.status === 'public')

/* =============================== */
/* Modal States                    */
/* =============================== */
const modals = ref({
    delete: false,
    edit: false,
    detail: false,
    rejected: false
})

const openModal = (type: keyof typeof modals.value) => {
    modals.value[type] = true
}

/* =============================== */
/* Card Information                */
/* =============================== */
const cardInfo = computed(() => ({
    title: props.item.title || 'Untitled Channel',
    description: props.item.description || 'ยังไม่ได้เขียนคำอธิบายแชนแนล',
    link: `/channels/${props.item.channels_id}`,
    fileCount: `${props.item.file_count ?? 0} ไฟล์`,
    createdBy: props.item.created_by_name,
    createdAt: props.item.created_at
        ? new Date(props.item.created_at).toLocaleString('th-TH', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'ไม่ทราบวันที่'
}))

/* =============================== */
/* Status Badge Configuration      */
/* =============================== */
const STATUS_CONFIG = {
    public: { color: 'success', label: 'Public' },
    private: { color: 'error', label: 'Private' },
    pending: { color: 'warning', label: 'Pending' }
} as const

const statusBadge = computed(() => {
    const status = props.item.status as keyof typeof STATUS_CONFIG
    return STATUS_CONFIG[status] || { color: 'neutral', label: status }
})

/* =============================== */
/* Status Actions                  */
/* =============================== */
const handleAction = async (action: () => Promise<void>, successMsg: string, errorMsg: string) => {
    if (loading.value) return // ป้องกันการกดย้ำขณะโหลด
    try {
        await action()
        toast.add({ title: successMsg, color: 'success' })
        emit('load')
    } catch (error) {
        toast.add({ title: 'เกิดข้อผิดพลาด', description: errorMsg, color: 'error' })
    }
}

const handleRequestPublic = () => handleAction(
    async () => { await requestPublicChannel(props.item.channels_id) },
    'ส่งคำขอเรียบร้อยแล้ว',
    'ไม่สามารถส่งคำขอได้'
)

const handleCancelRequest = () => handleAction(
    async () => { await cancelRequestPublicChannel(props.item.channels_id) },
    'ยกเลิกคำขอเรียบร้อยแล้ว',
    'ไม่สามารถยกเลิกคำขอได้'
)

const handleSetPrivate = () => handleAction(
    async () => { await ownerSetPrivateChannel(props.item.channels_id) },
    'ตั้งค่าเป็นส่วนตัวเรียบร้อยแล้ว',
    'ดำเนินการไม่สำเร็จ'
)

/* =============================== /
/ Status Switch (Admin)           /
/ =============================== */
const isPublic = ref(props.item.status === 'public')
const statusLoading = ref(false)

watch(() => props.item.status, (newStatus) => {
    isPublic.value = newStatus === 'public'
})

watch(isPublic, async (val, oldVal) => {
    // ป้องกันการทำงานซ้ำ หรือค่าไม่ได้เปลี่ยนจริง
    if (statusLoading.value || val === (props.item.status === 'public')) return

    statusLoading.value = true
    try {
        // ✅ เพิ่มเงื่อนไขเช็ค Admin ตรงนี้
        if (isAdmin.value) {
            if (val) {
                // กรณี Admin เปิด Switch -> บังคับเป็น Public
                await adminforceSetPublicChannel(props.item.channels_id)
            } else {
                // กรณี Admin ปิด Switch -> บังคับเป็น Private
                await adminforceSetPrivateChannel(props.item.channels_id)
            }
        } else {
            // Logic เดิมสำหรับ Owner (เผื่อในอนาคตมีการใช้ Switch นี้กับ Owner)
            if (val) {
                if (props.item.status === 'private') {
                    await requestPublicChannel(props.item.channels_id)
                }
                // บรรทัดนี้อาจจะไม่จำเป็นถ้า requestPublicChannel จัดการให้แล้ว แต่ใส่ไว้ตาม Logic เดิม
                await statusChannel(props.item.channels_id, true)
            } else {
                await ownerSetPrivateChannel(props.item.channels_id)
            }
        }

        emit('load')
    } catch (err) {
        console.error(err)
        isPublic.value = oldVal // คืนค่า Switch กลับหาก Error
        toast.add({
            title: 'เกิดข้อผิดพลาด',
            description: 'ไม่สามารถเปลี่ยนสถานะได้',
            color: 'error'
        })
    } finally {
        statusLoading.value = false
    }
})

/* =============================== */
/* Dropdown Menu                   */
/* =============================== */
const dropdownItems = computed<DropdownMenuItem[][]>(() => {
    /* ---------- ทุกคนเห็น ---------- */
    const detailMenu: DropdownMenuItem[] = [
        {
            label: 'Detail',
            icon: 'i-lucide-eye',
            class: 'cursor-pointer',
            onSelect: () => openModal('detail')
        }
    ]

    /* =========================
       Guest (ยังไม่ login)
    ========================= */
    if (!isLoggedIn.value) {
        return [detailMenu]
    }

    /* =========================
       Admin → ทำได้หมด
    ========================= */
    if (isAdmin.value) {
        const adminActions: DropdownMenuItem[] = [...detailMenu]

        // เพิ่มปุ่ม Edit
        adminActions.push({
            label: 'Edit',
            icon: 'i-lucide-pencil',
            class: 'cursor-pointer',
            onSelect: () => openModal('edit')
        })

        const statusSection: DropdownMenuItem[] = [
            {
                slot: 'status-switch',
                onSelect: (e: Event) => e.preventDefault()
            }
        ]

        // --- เพิ่มเงื่อนไขปุ่ม REJECT สำหรับ Admin เท่านั้น ---
        if (props.item.status === 'pending') {
            statusSection.push({
                label: 'Reject Request',
                icon: 'i-lucide-ban',
                color: 'error',
                class: 'cursor-pointer text-red-600',
                onSelect: () => openModal('rejected') // เปิด Modal ที่คุณเตรียมไว้
            })
        }

        return [
            adminActions,
            statusSection,
            [
                {
                    label: 'Delete',
                    icon: 'i-lucide-trash',
                    color: 'error',
                    class: 'cursor-pointer',
                    onSelect: () => openModal('delete')
                }
            ]
        ]
    }

    /* =========================
       User แต่ไม่ใช่เจ้าของ
       และเป็น public
    ========================= */
    if (!isOwner.value && isPublicChannel.value) {
        return [detailMenu]
    }

    /* =========================
       User เจ้าของแชนแนล
    ========================= */
    const ownerMenu: DropdownMenuItem[] = [
        ...detailMenu,
        {
            label: 'Edit',
            icon: 'i-lucide-pencil',
            class: 'cursor-pointer',
            onSelect: () => openModal('edit')
        }
    ]

    const statusMenu: DropdownMenuItem[] = []

    if (props.item.status === 'private') {
        statusMenu.push({
            label: 'ส่งคำขอเป็นสาธารณะ',
            icon: 'i-lucide-cloud',
            onSelect: handleRequestPublic
        })
    }

    if (props.item.status === 'pending') {
        statusMenu.push({
            label: 'ยกเลิกคำขอ',
            icon: 'i-lucide-x-circle',
            color: 'error',
            onSelect: handleCancelRequest
        })
    }

    if (props.item.status === 'public') {
        statusMenu.push({
            label: 'ตั้งเป็นส่วนตัว',
            icon: 'i-lucide-lock',
            onSelect: handleSetPrivate
        })
    }

    const deleteMenu: DropdownMenuItem[] = [
        {
            label: 'Delete',
            icon: 'i-lucide-trash',
            color: 'error',
            class: 'cursor-pointer',
            onSelect: () => openModal('delete')
        }
    ]

    return [ownerMenu, statusMenu, deleteMenu]
})

/* =============================== */
/* User Testimonial                */
/* =============================== */
const testimonial = computed(() => ({
    user: {
        name: cardInfo.value.createdBy,
        description: cardInfo.value.createdAt,
        avatar: {
            src: 'https://avatars.githubusercontent.com/u/0?v=4',
            alt: 'User avatar'
        }
    }
}))
</script>

<template>
    <div class="w-full max-w-md mx-auto relative">
        <UPageCard :title="cardInfo.title" :description="cardInfo.description" :to="cardInfo.link" variant="subtle"
            class="w-full cursor-pointer">
            <template #footer>
                <div class="pb-3 flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2">
                        <UBadge :color="statusBadge.color" size="md" variant="subtle">
                            {{ statusBadge.label }}
                        </UBadge>
                        <span class="text-gray-500 dark:text-gray-400">
                            {{ cardInfo.fileCount }}
                        </span>
                    </div>
                </div>

                <UUser v-bind="testimonial.user" />
            </template>
        </UPageCard>

        <div class="absolute top-2 right-2 z-10">
            <UDropdownMenu :items="dropdownItems" :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
                :ui="{ content: 'w-48' }">
                <UButton variant="ghost" icon="i-lucide-more-vertical" aria-label="More actions"
                    class="p-1 cursor-pointer" />

                <template #status-switch>
                    <div class="flex items-center justify-between w-full" @click.stop>
                        <div class="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                            <UIcon name="i-lucide-globe" class="w-4.5 h-4.5 text-gray-500" />
                            <span class="truncate">Public Access</span>
                        </div>

                        <USwitch v-model="isPublic" :disabled="statusLoading" />
                    </div>
                </template>
            </UDropdownMenu>
        </div>
    </div>

    <ModalDelete v-model:open="modals.delete" :item="{ channels_id: props.item.channels_id, title: props.item.title }"
        @deleted="emit('load')" />

    <ModalEdit v-model:open="modals.edit" :item="{
        channels_id: props.item.channels_id,
        title: props.item.title,
        description: props.item.description
    }" @edit="emit('load')" />

    <ModalDetail v-model:open="modals.detail" :item="props.item" @edit="emit('load')" />

    <ModalRejected v-model:open="modals.rejected" :item="{
        channels_id: props.item.channels_id,
        title: props.item.title
    }" @rejected="emit('load')" />
</template>