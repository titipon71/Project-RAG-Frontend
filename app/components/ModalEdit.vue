<script setup lang="ts">
const { updateChannel, loading } = useChannel()
const toast = useToast()

const props = defineProps<{
    open: boolean        // ใช้กับ v-model:open จาก parent
    item: {
        channels_id: number
        title: string
        description?: string | null
    }
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void  // สำหรับ v-model:open
    (e: 'edit'): void                         // บอก parent ว่าแก้ไขเสร็จแล้ว
}>()

const form = reactive({
    title: '',
    description: ''
})

// sync ค่า props.item -> form เวลาเปิด modal หรือเปลี่ยน item
watch(
    () => props.item,
    (val) => {
        if (!val) return
        form.title = val.title ?? ''
        form.description = val.description ?? ''
    },
    { immediate: true }
)

const close = () => {
    emit('update:open', false)
}

// ตัวกันที่ไม่กรอกชื่อ
// async function validate(data: Partial<typeof form>) {
//     const errors = []

//     if (!data.title || !data.title.trim().length) {
//         errors.push({ name: 'title', message: 'กรุณากรอกชื่อแชนแนล' })
//     }

//     return errors
// }

// :state="form" :validate="validate เรียกใช้

const handleEdit = async () => {
    if (!form.title.trim()) {
        toast.add({
            title: 'กรุณากรอกชื่อแชนแนล',
            icon: 'i-lucide-alert-circle',
            color: 'warning'
        })
        return
    }

    try {
        await updateChannel(props.item.channels_id, {
            title: form.title.trim(),
            description: form.description
        })

        toast.add({
            title: 'บันทึกสำเร็จ!',
            description: `แก้ไขแชนแนล ${form.title} แล้ว`,
            icon: 'i-lucide-check-circle',
            color: 'success'
        })

        emit('edit')   // ให้ parent reload list
        close()
    } catch (e: any) {
        toast.add({
            title: 'Error',
            description:
                e?.data?.detail || e?.message || 'แก้ไขไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
            icon: 'i-lucide-x-circle',
            color: 'error'
        })
    }
}
</script>

<template>
    <UModal :open="open" @update:open="emit('update:open', $event)" title="แก้ไขแชนแนล">
        <template #body>
            <UForm @submit.prevent="handleEdit">
                <UFormField name="title" label="ชื่อแชนแนล" size="xl">
                    <UInput v-model="form.title" type="text" size="xl" placeholder="แก้ไขชื่อแชนแนลของคุณ..."
                        class="w-full pt-2" @keyup.enter="handleEdit" />
                </UFormField>

                <UFormField name="description" label="รายละเอียดของแชนแนล" size="xl" class="mt-4">
                    <UTextarea v-model="form.description" size="xl" placeholder="แก้ไขคำอธิบายของแชนแนล..."
                        class="w-full pt-2" />
                </UFormField>

                <div class="pt-3 flex gap-2">
                    <!-- ปุ่มบันทึก -->
                    <UButton size="lg" type="submit" :disabled="loading"
                        class="cursor-pointer mr-2 flex items-center justify-center gap-2">
                        <!-- icon หมุนตอนกำลังบันทึก -->
                        <UIcon v-if="loading" name="i-heroicons-arrow-path" class="animate-spin" />

                        <!-- ข้อความ -->
                        <span>
                            {{ loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
                        </span>
                    </UButton>

                    <!-- ปุ่มยกเลิก -->
                    <UButton size="lg" class="cursor-pointer" @click="close" type="button">
                        ยกเลิก
                    </UButton>
                </div>

            </UForm>
        </template>
    </UModal>
</template>
