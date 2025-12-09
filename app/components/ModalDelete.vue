<script setup lang="ts">
const { deleteChannel, loading } = useChannel()
const toast = useToast()

const props = defineProps<{
    open: boolean        // รับสถานะเปิดจาก v-model:open
    item: {
        channels_id: number
        title: string
    }
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void  // สำหรับ v-model:open
    (e: 'deleted'): void                      // บอก parent ว่าลบเสร็จแล้ว
}>()

const close = () => {
    emit('update:open', false)
}

const handleDelete = async () => {
    const id = props.item.channels_id

    try {
        await deleteChannel(id)
        toast.add({
            title: 'Successful!',
            description: `ลบแชนแนล ${props.item.title} แล้ว`,
            icon: 'i-lucide-check-circle',
            color: 'success'
        })

        emit('deleted')   // ให้ parent ไป reload list
        close()
    } catch (e: any) {
        toast.add({
            title: 'Error',
            description: e?.data?.detail || e?.message || 'ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
            icon: 'i-lucide-x-circle',
            color: 'error'
        })
    }
}
</script>

<template>
    <!-- ใช้ :open + @update:open แทน v-model ตรง ๆ -->
    <UModal :open="open" @update:open="emit('update:open', $event)" title="ยืนยันการลบแชนแนล">
        <template #body>
            <p class="mb-4 text-red-500 text-md">
                การลบจะไม่สามารถย้อมกลับมาได้และเอกสารทุกไฟล์จะถูกลบออกหมด
            </p>

            <p class="mb-4 text-md">
                คุณต้องการลบแชนแนล
                <span class="font-semibold text-red-500">"{{ item?.title }}"</span>
                ใช่หรือไม่?
            </p>

            <div class="pt-2">

                <UButton size="lg" color="error" :loading="loading" @click="handleDelete" class="cursor-pointer mr-2">
                    ลบแชนแนล
                </UButton>

                <UButton size="lg" class="cursor-pointer" @click="close">
                    ยกเลิก
                </UButton>

            </div>
        </template>
    </UModal>
</template>
