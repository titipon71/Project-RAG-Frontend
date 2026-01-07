<script setup lang="ts">
const { createChannel, loading } = useChannel()
const toast = useToast()

const props = defineProps<{
    open: boolean
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
}>()

// กำหนดค่าเริ่มต้นเป็นค่าว่าง
const form = reactive({
    title: '',
    description: ''
})

const channelForm = ref()

// ฟังก์ชันล้างค่าข้อมูลในฟอร์ม
const resetForm = () => {
    form.title = ''
    form.description = ''
}

// ตรวจสอบสถานะการเปิด/ปิด Modal
watch(() => props.open, (isOpen) => {
    if (!isOpen) {
        resetForm() // ล้างค่าทันทีที่ Modal ถูกปิด เพื่อไม่ให้ค้างตอนเปิดใหม่
    }
})

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
    try {
        const id = await createChannel({
            title: form.title.trim(),
            description: form.description,
        })
        // await new Promise<void>(res => setTimeout(res, 1000))
        navigateTo(`/channels/${id}`)
        toast.add({
            title: 'Successful!',
            description: `สร้างแชนแนล ${form.title} แล้ว`,
            icon: 'i-lucide-check-circle',
            color: 'success'
        })
        close()
    } catch (e: any) {
        toast.add({
            title: 'Error',
            description: 'สร้างไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
            color: 'error'
        })
    }
}
</script>

<template>
    <UModal :open="open" @update:open="emit('update:open', $event)"
        :ui="{ content: 'sm:max-w-lg', overlay: 'backdrop-blur-sm' }">
        <slot />
        <template #header>
            <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                    <UIcon name="i-heroicons-plus-circle" class="w-6 h-6 text-white" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">สร้างแชนแนลใหม่</h3>
            </div>
        </template>

        <template #body>
            <UForm ref="channelForm" :state="form" :validate="validate" :validate-on="[]" @submit.prevent="onSubmit"
                class="space-y-6">
                <UFormField name="title" label="ชื่อแชนแนล" size="xl">
                    <UInput v-model="form.title" :autofocus="false" size="xl" placeholder="ชื่อแชนแนลของคุณ..."
                        class="w-full" />
                </UFormField>
                <UFormField name="description" label="รายละเอียด" size="xl">
                    <UTextarea v-model="form.description" size="xl" placeholder="คำอธิบาย..." class="w-full"
                        :rows="4" />
                </UFormField>
            </UForm>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3">
                <UButton label="ยกเลิก" color="neutral" variant="ghost" @click="close" class="cursor-pointer" />
                <UButton label="สร้างแชนแนล" color="primary" :loading="loading" @click="channelForm?.submit()"
                    class="cursor-pointer px-6" />
            </div>
        </template>
    </UModal>
</template>