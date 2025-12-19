<script setup lang="ts">
const { statusChannel, loading } = useChannel()
const toast = useToast()

const props = defineProps<{
    open: boolean
    item: {
        channels_id: number
        title: string
    }
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'rejected'): void // บอก parent ว่าปฏิเสธเรียบร้อย ให้ reload
}>()

const form = reactive({
    reason: ''
})

// Reset form และล้างค่าทุกครั้งที่สถานะการเปิดเปลี่ยนไป
watch(
    () => props.open,
    (isOpen) => {
        if (!isOpen) {
            form.reason = ''
        }
    }
)

const close = () => {
    emit('update:open', false)
}

const handleSubmit = async () => {
    // Validation: บังคับให้ใส่เหตุผล
    if (!form.reason.trim()) {
        toast.add({
            title: 'กรุณาระบุเหตุผล',
            description: 'จำเป็นต้องระบุสาเหตุในการปฏิเสธคำขอ',
            icon: 'i-lucide-alert-circle',
            color: 'warning'
        })
        return
    }

    try {
        // เรียก API: approve = false, ส่ง reason ไปด้วย
        await statusChannel(props.item.channels_id, false, form.reason.trim())

        toast.add({
            title: 'ดำเนินการสำเร็จ',
            description: `ปฏิเสธแชนแนล ${props.item.title} เรียบร้อยแล้ว`,
            icon: 'i-lucide-check-circle',
            color: 'success'
        })

        emit('rejected') // สั่ง parent reload
        close()
    } catch (e: any) {
        toast.add({
            title: 'Error',
            description: e?.data?.detail || e?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
            icon: 'i-lucide-x-circle',
            color: 'error'
        })
    }
}
</script>

<template>
    <UModal :open="open" @update:open="emit('update:open', $event)" :ui="{
        content: 'sm:max-w-md',
        overlay: 'backdrop-blur-sm'
    }">
        <template #header>
            <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                    <UIcon name="i-heroicons-x-circle" class="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">ปฏิเสธคำขอเผยแพร่</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">ระบุเหตุผลที่ไม่อนุมัติคำขอนี้</p>
                </div>
            </div>
        </template>

        <template #body>
            <UForm @submit.prevent="handleSubmit" class="space-y-5">
                <div
                    class="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50">
                    <p class="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                        คุณกำลังจะปฏิเสธคำขอของแชนแนล
                        <span class="font-black underline decoration-orange-400">"{{ item.title }}"</span>
                        ระบบจะแจ้งเหตุผลนี้กลับไปยังเจ้าของแชนแนล
                    </p>
                </div>

                <UFormField name="reason" label="ระบุเหตุผลในการปฏิเสธ (Required)" size="xl" required>
                    <UTextarea v-model="form.reason" size="xl" :autofocus="false"
                        placeholder="เช่น เนื้อหาไม่เหมาะสม, ข้อมูลไม่เพียงพอ หรือผิดกฎการใช้งาน..." class="w-full"
                        :rows="4" />
                </UFormField>
            </UForm>
        </template>

        <template #footer>
            <div class="flex gap-3 justify-end w-full">
                <UButton size="lg" variant="ghost" color="neutral" class="cursor-pointer font-bold" @click="close"
                    :disabled="loading">
                    ยกเลิก
                </UButton>

                <UButton size="lg" color="error" @click="handleSubmit" :disabled="loading"
                    class="cursor-pointer px-6 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                    <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin" />
                    <span>{{ loading ? 'กำลังดำเนินการ...' : 'ยืนยันการปฏิเสธ' }}</span>
                </UButton>
            </div>
        </template>
    </UModal>
</template>