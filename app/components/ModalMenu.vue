<!-- components/ModalMenu.vue -->
<script setup lang="ts">
const onSubmit = () => {
    // logic สร้างแชนแนล (เดี๋ยวค่อยต่อกับ API)
    console.log('submit create channel')
}
</script>

<template>
    <!-- UModal ของ Nuxt UI -->
    <UModal title="สร้างแชนแนลใหม่">
        <!-- อันนี้คือ "ตัว trigger" -->
        <!-- อะไรที่ parent ส่งมาใน <slot> จะกลายเป็นปุ่ม/การ์ดที่กดเปิด modal -->
        <slot />

        <!-- เนื้อหาใน modal -->
        <template #body>
            <form id="channel-form" @submit.prevent="onSubmit">
                <div class="mb-4">
                    <div class="text-md">ชื่อแชนแนล</div>
                    <UInput type="text" size="xl" placeholder="สร้างชื่อแชนแนลของคุณ..." class="w-full pt-2" />
                </div>

                <div class="mb-4">
                    <div class="text-md">รายละเอียดของแชนแนล</div>
                    <UTextarea size="xl" placeholder="สร้างคำอธิบายของแชนแนลเพื่อให้คนอื่นเข้าใจมากขึ้น..."
                        class="w-full pt-2" />
                </div>

                <UButton label="สร้าง" size="xl" type="submit" color="primary" class="cursor-pointer" />
            </form>
        </template>
    </UModal>
</template>
