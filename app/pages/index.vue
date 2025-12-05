<script setup lang="ts">

</script>

<template>
    <nav class="flex items-center justify-between py-4">
        <NuxtLink to="/" class="text-xl">ระบบจัดการห้องสนทนา</NuxtLink>
        <div>
            <UserMenu />
        </div>
    </nav>
    <USeparator size="md" />

    <main>
        <ChannelList />
    </main>
</template>