<script setup lang="ts">
/* ============================================
   Imports & Composables
============================================ */
const route = useRoute()

const { createSession, getChatHistory, sendOllamaReply, loading: chatLoading } = useChat()

/* ============================================
   Props
============================================ */
const props = defineProps<{
    channelTitle: string
    fileCount: number
}>()

/* ============================================
   Computed Properties
============================================ */
const channelId = computed(() => route.params.id as string)
const canSendMessage = computed(() => state.message.trim().length > 0)

/* ============================================
   State Management
============================================ */
const state = reactive({
    message: '',
    chatHistory: [] as any[],
    sessionId: '',
    isTyping: false
})

/* ============================================
   Refs
============================================ */
const chatContainer = ref<HTMLElement | null>(null)

/* ============================================
   Chat Logic
============================================ */
const initChatSession = async () => {
    try {
        const session = await createSession(channelId.value)
        state.sessionId = session.sessions_id

        // Optional: Load chat history
        // const history = await getChatHistory(state.sessionId)
        // state.chatHistory = history.map(h => ({
        //     id: h.chat_id,
        //     role: h.sender_type,
        //     text: h.message,
        //     citations: []
        // }))
    } catch (err) {
        console.error('Init session failed:', err)
    }
}

const handleSendMessage = async () => {
    if (!canSendMessage.value || state.isTyping) return

    const userText = state.message.trim()

    // แสดงข้อความฝั่ง User
    state.chatHistory.push({
        id: Date.now(),
        role: 'user',
        text: userText,
        citations: []
    })

    state.message = ''
    state.isTyping = true

    try {
        // ส่งไปหา AI
        const aiResponse = await sendOllamaReply(state.sessionId, userText)

        // แสดงข้อความฝั่ง AI
        state.chatHistory.push({
            id: Date.now() + 1,
            role: 'bot',
            text: aiResponse,
            citations: []
        })

        // Auto-scroll to bottom
        nextTick(() => {
            if (chatContainer.value) {
                chatContainer.value.scrollTop = chatContainer.value.scrollHeight
            }
        })
    } catch (err) {
        console.error('AI response failed:', err)
        // ลบข้อความ user ที่ส่งไปแล้วถ้า AI ไม่ตอบ
        state.chatHistory.pop()
        state.message = userText // คืนข้อความให้ user
    } finally {
        state.isTyping = false
    }
}

/* ============================================
   Lifecycle Hooks
============================================ */
onMounted(() => {
    initChatSession()
})

watch(() => route.params.id, () => {
    // Reset chat when channel changes
    state.chatHistory = []
    initChatSession()
})
</script>

<template>
    <main class="flex-1 flex-col relative min-w-0 flex">
        <!-- Header -->
        <div
            class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-6 sticky top-0 z-20 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
            <nav class="flex items-center justify-between py-5">
                <div class="flex items-center gap-3">
                    <div class="w-1 h-8 rounded-full bg-gradient-to-b from-primary-500 to-primary-600"></div>
                    <h1
                        class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">
                        {{ channelTitle }}
                    </h1>
                </div>
                <UserMenu />
            </nav>
        </div>

        <!-- Loading State -->
        <div v-if="chatLoading && state.chatHistory.length === 0" class="flex-1 flex items-center justify-center">
            <div class="text-center space-y-4">
                <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary-500" />
                <p class="text-gray-500">กำลังเตรียมห้องสนทนา...</p>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="fileCount === 0 && state.chatHistory.length === 0"
            class="flex-1 flex flex-col items-center justify-center gap-8 px-4 text-center">
            <div class="relative">
                <div
                    class="absolute inset-0 bg-gradient-to-r from-primary-400 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse">
                </div>
                <div
                    class="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-2xl">
                    <UIcon name="i-heroicons-chat-bubble-oval-left-ellipsis" class="w-12 h-12 text-white" />
                </div>
            </div>
            <div class="space-y-3">
                <h2
                    class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    เริ่มต้นการสนทนา
                </h2>
                <p class="text-gray-600 dark:text-gray-400 max-w-md text-lg">
                    เพิ่มแหล่งข้อมูลของคุณแล้วถามคำถามเกี่ยวกับเอกสารเหล่านั้นได้เลย
                </p>
            </div>
        </div>

        <!-- Chat Area -->
        <div v-else class="flex flex-col flex-1 relative overflow-hidden">
            <!-- Chat Messages -->
            <div ref="chatContainer"
                class="flex-1 w-full overflow-y-auto p-6 sm:p-10 space-y-8 scroll-smooth bg-gradient-to-b from-transparent via-gray-50/30 to-transparent dark:via-gray-900/30">

                <div v-for="msg in state.chatHistory" :key="msg.id"
                    :class="['flex animate-fade-in', msg.role === 'user' ? 'justify-end' : 'justify-start']">
                    <div :class="['max-w-3xl', msg.role === 'user' ? 'w-fit' : 'w-full']">

                        <!-- User Message -->
                        <div v-if="msg.role === 'user'"
                            class="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-3xl rounded-tr-md shadow-lg text-base font-medium">
                            {{ msg.text }}
                        </div>

                        <!-- AI Message -->
                        <UCard v-else :ui="{
                            body: { padding: 'p-6 sm:p-7' },
                            ring: 'ring-1 ring-gray-200/80 dark:ring-gray-800/80 shadow-lg',
                            rounded: 'rounded-3xl',
                            background: 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm'
                        }">
                            <div class="flex gap-5">
                                <div class="flex-shrink-0">
                                    <UAvatar icon="i-heroicons-sparkles" size="md"
                                        class="bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg" />
                                </div>
                                <div class="space-y-4 w-full text-gray-800 dark:text-gray-200 leading-8 text-base">
                                    <p class="whitespace-pre-wrap">{{ msg.text }}</p>
                                </div>
                            </div>
                        </UCard>
                    </div>
                </div>

                <!-- Typing Indicator -->
                <div v-if="state.isTyping" class="flex justify-start animate-fade-in">
                    <div class="flex gap-4 items-center bg-gray-100/50 dark:bg-gray-800/50 px-6 py-4 rounded-3xl">
                        <div class="flex gap-1">
                            <span class="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></span>
                            <span
                                class="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span
                                class="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                        <span class="text-sm text-gray-500 font-medium">Ollama กำลังประมวลผลคำตอบ...</span>
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <div
                class="shrink-0 p-6 pb-8 z-10 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900">
                <div class="w-full max-w-5xl mx-auto">
                    <form @submit.prevent="handleSendMessage">
                        <UChatPrompt v-model="state.message" variant="soft" placeholder="ถามคำถามเกี่ยวกับเอกสาร..."
                            :rows="1" autoresize :disabled="state.isTyping"
                            @keydown.enter.exact.prevent="handleSendMessage"
                            class="shadow-2xl border-2 border-gray-200 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 focus-within:ring-4 focus-within:ring-primary-500/20 focus-within:border-primary-400 transition-all duration-300 hover:shadow-3xl"
                            :ui="{
                                wrapper: 'relative',
                                base: 'pl-6 pr-14 py-5 text-base'
                            }">
                            <template #trailing>
                                <div class="absolute right-4 bottom-auto top-0 flex items-center h-full">
                                    <UChatPromptSubmit @click="handleSendMessage" size="md" color="primary"
                                        :disabled="!canSendMessage || state.isTyping" icon="i-heroicons-paper-airplane"
                                        class="transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl"
                                        :class="{
                                            'scale-0 opacity-0 rotate-90': !canSendMessage,
                                            'scale-100 opacity-100 rotate-0 hover:scale-110': canSendMessage
                                        }" />
                                </div>
                            </template>
                        </UChatPrompt>
                    </form>
                    <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
                        กด Enter เพื่อส่งข้อความ · Shift + Enter เพื่อขึ้นบรรทัดใหม่
                    </p>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
}

.overflow-y-auto::-webkit-scrollbar {
    width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, rgba(156, 163, 175, 0.3), rgba(156, 163, 175, 0.5));
    border-radius: 99px;
    transition: background 0.3s;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, rgba(156, 163, 175, 0.5), rgba(156, 163, 175, 0.7));
}
</style>