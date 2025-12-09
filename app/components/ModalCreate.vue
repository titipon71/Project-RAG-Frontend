<script setup lang="ts">

const { createChannel, loading } = useChannel()
const toast = useToast()

const form = reactive<{ title: string; description: string | null }>({
    title: '',
    description: null,
})

// ref ของ UForm
const channelForm = ref()

async function validate(data: Partial<typeof form>) {
    const errors = []

    if (!data.title || !data.title.trim().length) {
        errors.push({ name: 'title', message: 'กรุณากรอกชื่อแชนแนล' })
    }

    return errors
}

const onSubmit = async () => {
    const id = await createChannel({
        title: form.title,
        description: form.description,
    })
    await new Promise<void>(res => setTimeout(res, 1000))
    navigateTo(`/channels/${id}`)
    toast.add({
        title: 'Successful!',
        description: `สร้างแชนแนล, ${form.title}`,
        icon: 'i-lucide-check-circle',
        color: 'success'
    })
}

// ฟังก์ชันให้ input เรียกเวลา Enter
const submitForm = () => {
    channelForm.value?.submit()
}
</script>

<template>
    <UModal title="สร้างแชนแนลใหม่">
        <slot />

        <template #body>
            <UForm ref="channelForm" :state="form" :validate="validate" @submit.prevent="onSubmit">
                <UFormField name="title" label="ชื่อแชนแนล" size="xl">
                    <UInput v-model="form.title" type="text" size="xl" placeholder="สร้างชื่อแชนแนลของคุณ..."
                        class="w-full pt-2" @keyup.enter="submitForm" />
                </UFormField>

                <UFormField name="description" label="รายละเอียดของแชนแนล" size="xl" class="mt-4">
                    <UTextarea v-model="form.description" size="xl"
                        placeholder="สร้างคำอธิบายของแชนแนลเพื่อให้คนอื่นเข้าใจมากขึ้น..." class="w-full pt-2" />
                </UFormField>

                <UButton label="สร้างแชนแนล" size="xl" type="submit" color="primary" class="cursor-pointer mt-4"
                    loading-auto />
            </UForm>
        </template>
    </UModal>
</template>
