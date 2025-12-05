<template>
    <UModal title="สร้างแชนแนลใหม่">
        <UButton class="cursor-pointer" label="สร้างแชนแนลใหม่" color="secondary" variant="solid" />

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