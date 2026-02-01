<script setup lang="ts">
const toast = useToast()

interface FormData {
    title: string
    description: string
}

const props = defineProps<{
    open: boolean
    mode: 'create' | 'edit'
    loading?: boolean
    item?: {
        channels_id: number
        title: string
        description?: string | null
    }
    // parent ส่ง handler มา แบบเดียวกับ ModalDelete
    createHandler: (data: FormData) => Promise<void>
    editHandler: (id: number, data: FormData) => Promise<void>
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'edit'): void // บอก parent ว่าแก้ไขเสร็จ (เฉพาะ edit mode)
}>()

const isEdit = computed(() => props.mode === 'edit')

const form = reactive({
    title: '',
    description: ''
})

const channelForm = ref()

// ล้าง form
const resetForm = () => {
    form.title = ''
    form.description = ''
}

// เมื่อเปิด modal หรือเปลี่ยน mode/item ให้ sync ค่า
watch(
    () => [props.open, props.mode, props.item],
    ([isOpen]) => {
        if (!isOpen) {
            resetForm()
            return
        }
        if (props.mode === 'edit' && props.item) {
            form.title = props.item.title ?? ''
            form.description = props.item.description ?? ''
        } else {
            resetForm()
        }
    },
    { immediate: true }
)

const close = () => {
    emit('update:open', false)
}

const validate = async (data: any) => {
    const errors = []
    if (!data.title?.trim()) {
        errors.push({ name: 'title', message: 'กรุณากรอกชื่อแชนแนล' })
    }
    return errors
}

const onSubmit = async () => {
    const payload = {
        title: form.title.trim(),
        description: form.description
    }

    try {
        if (isEdit.value) {
            await props.editHandler(props.item!.channels_id, payload)
            toast.add({
                title: 'บันทึกสำเร็จ!',
                description: `แก้ไขแชนแนล ${form.title} แล้ว`,
                icon: 'i-lucide-check-circle',
                color: 'success'
            })
            emit('edit')
        } else {
            await props.createHandler(payload)
            toast.add({
                title: 'Successful!',
                description: `สร้างแชนแนล ${form.title} แล้ว`,
                icon: 'i-lucide-check-circle',
                color: 'success'
            })
        }
        close()
    } catch (e: any) {
        toast.add({
            title: 'Error',
            description: e?.data?.detail || e?.message || (isEdit.value ? 'แก้ไขไม่สำเร็จ' : 'สร้างไม่สำเร็จ') + ' กรุณาลองใหม่อีกครั้ง',
            icon: 'i-lucide-x-circle',
            color: 'error'
        })
    }
}

// UI computed
const headerIcon = computed(() => isEdit.value ? 'i-heroicons-pencil-square' : 'i-heroicons-plus-circle')
const headerTitle = computed(() => isEdit.value ? 'แก้ไขข้อมูลแชนแนล' : 'สร้างแชนแนลใหม่')
const submitLabel = computed(() => isEdit.value ? 'บันทึกการแก้ไข' : 'สร้างแชนแนล')
</script>

<template>
    <UModal :open="open" @update:open="emit('update:open', $event)" :ui="{
        content: 'sm:max-w-lg',
        overlay: 'backdrop-blur-sm'
    }">
        <template #header>
            <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                    <UIcon :name="headerIcon" class="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ headerTitle }}</h3>
                    <p v-if="isEdit" class="text-sm text-gray-500 dark:text-gray-400">
                        ปรับปรุงชื่อและรายละเอียดของแชนแนลของคุณ
                    </p>
                </div>
            </div>
        </template>

        <template #body>
            <UForm ref="channelForm" :state="form" :validate="validate" :validate-on="[]" @submit.prevent="onSubmit"
                class="space-y-6">
                <UFormField name="title" label="ชื่อแชนแนล" size="xl" :required="isEdit">
                    <UInput v-model="form.title" size="xl"
                        :placeholder="isEdit ? 'กรอกชื่อแชนแนลใหม่...' : 'ชื่อแชนแนลของคุณ...'" class="w-full"
                        :icon="isEdit ? 'i-heroicons-tag' : undefined" />
                </UFormField>

                <UFormField name="description" label="รายละเอียด" size="xl">
                    <UTextarea v-model="form.description" size="xl"
                        :placeholder="isEdit ? 'เพิ่มคำอธิบายเกี่ยวกับแชนแนลนี้...' : 'คำอธิบาย...'" class="w-full"
                        :rows="4" />
                </UFormField>
            </UForm>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3">
                <UButton size="lg" color="neutral" variant="ghost" class="cursor-pointer" @click="close"
                    :disabled="loading">
                    ยกเลิก
                </UButton>
                <UButton size="lg" color="primary" :loading="loading" :disabled="loading"
                    class="cursor-pointer px-6 shadow-md" @click="channelForm?.submit()">
                    {{ submitLabel }}
                </UButton>
            </div>
        </template>
    </UModal>
</template>
