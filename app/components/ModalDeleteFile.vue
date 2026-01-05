<script setup lang="ts">
const { loading, error, deleteFile } = useFileChannel()
const toast = useToast()

const props = defineProps<{
    open: boolean         // รับค่า v-model:open จาก Parent
    file: {
        files_id: string
        original_filename: string
    } | null
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'deleted', fileId: string): void
}>()

// ฟังก์ชันปิดที่ใช้ emit ค่ากลับไปหาหน้าหลัก
const close = () => {
    emit('update:open', false)
}

const handleFileDelete = async () => {
    if (!props.file) return

    try {
        await deleteFile(props.file.files_id)
        toast.add({
            title: 'สำเร็จ',
            description: 'ลบไฟล์เรียบร้อย',
            color: 'success'
        })
        emit('deleted', props.file.files_id)
        close() // ปิด modal เมื่อลบสำเร็จ
    } catch (err) {
        toast.add({
            title: 'เกิดข้อผิดพลาด',
            description: 'ไม่สามารถลบไฟล์ได้',
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
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">ยืนยันการลบ</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
            </div>
        </template>

        <template #body>
            <div class="space-y-4" v-if="file">
                <UAlert color="error" variant="soft" icon="i-heroicons-exclamation-circle">
                    <template #title>คำเตือน</template>
                    <template #description>การลบจะไม่สามารถย้อนกลับได้และไฟล์นี้จะถูกลบออกถาวร</template>
                </UAlert>

                <p class="text-gray-700 dark:text-gray-300">
                    คุณต้องการลบไฟล์
                    <span class="font-semibold text-red-600 dark:text-red-400">"{{ file.original_filename }}"</span>
                    ใช่หรือไม่?
                </p>
            </div>
        </template>

        <template #footer>
            <div class="flex gap-3 justify-end">
                <UButton size="lg" color="neutral" variant="ghost" @click="close" class="cursor-pointer">
                    ยกเลิก
                </UButton>

                <UButton size="lg" color="error" @click="handleFileDelete" :disabled="loading"
                    class="cursor-pointer flex items-center gap-2">
                    <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin" />
                    <span>{{ loading ? 'กำลังลบ...' : 'ลบไฟล์' }}</span>
                </UButton>
            </div>
        </template>
    </UModal>
</template>