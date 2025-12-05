<script setup lang="ts">

const onSubmit = () => {
    // ใส่ Logic บันทึกข้อมูลตรงนี้
    console.log('Create channel...')
}
</script>

<template>
    <UModal title="สร้างแชนแนลใหม่">

        <button type="button"
            class="w-full h-full min-h-[200px] bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group">
            <div
                class="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UIcon name="i-heroicons-plus" class="w-7 h-7 text-blue-600" />
            </div>

            <span class="text-lg font-medium text-black-700 group-hover:text-blue-600 transition-colors">
                สร้างแชนแนลใหม่
            </span>
        </button>

        <template #body>
            <form id="channel-form" @submit.prevent="">
                <div class="mb-4">
                    <div class="text-sm">ชื่อแชนแนล</div>
                    <UInput type="text" class="w-full pt-2" />
                </div>
                <div class="mb-4">
                    <div class="text-sm">รายละเอียดของแชนแนล</div>
                    <UTextarea size="xl" placeholder="Type something..." class="w-full pt-2" />
                </div>
                <div class="flex justify-start gap-2 pt-4">
                    <UButton to="/channels/[id].vue" label="สร้าง" size="xl" type="submit" color="primary"
                        class="cursor-pointer" />
                </div>
            </form>
        </template>
    </UModal>
</template>