export const useChat = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const authStore = useAuthStore();
  const error = ref<string | null>(null);
  const loading = ref(false);

  // Base URL สำหรับ Chat API
  const chatBase = apiBase;

  // Helper function สำหรับ headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`;
    }

    return headers;
  };

  // 1. สร้าง Session ใหม่ - ใช้ POST /session (ไม่ใช่ /create/session)
  const createSession = async (channelId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await $fetch<any>(`${chatBase}/session`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: { channel_id: channelId },
        credentials: "include",
      });

      console.log("Create session response:", data);

      // ดึง session_id จาก response (รองรับหลายรูปแบบ)
      const sessionId =
        data?.session_id || data?.sessions_id || data?.id || data?.sessionId;

      if (!sessionId) {
        throw new Error("ไม่พบ session_id ใน response");
      }

      return {
        sessions_id: sessionId,
        session_id: sessionId,
        channel_id: channelId,
        ...data,
      };
    } catch (err: any) {
      const errorMsg =
        err?.data?.detail || err?.message || "ไม่สามารถสร้าง Session ได้";
      error.value = errorMsg;
      console.error("Create session error:", err);
      throw new Error(errorMsg);
    } finally {
      loading.value = false;
    }
  };

  // 3. ส่งข้อความแชทกับ Ollama - ใช้ POST /sessions/ollama-reply
  const sendOllamaReply = async (sessionId: string, message: string) => {
    error.value = null;

    try {
      const data = await $fetch<any>(`${chatBase}/sessions/ollama-reply`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: {
          sessions_id: sessionId, // ใช้ sessions_id ตาม API
          message: message,
        },
        credentials: "include",
      });

      // ดึงข้อความตอบกลับจาก AI (รองรับหลายรูปแบบ)
      let replyText = "";

      if (data?.ai_message?.message) {
        replyText = data.ai_message.message;
      } else if (typeof data === "string") {
        replyText = data;
      } else if (
        data?.reply ||
        data?.answer ||
        data?.content ||
        data?.message
      ) {
        replyText = data.reply || data.answer || data.content || data.message;
      } else {
        replyText = "ไม่สามารถอ่านรูปแบบการตอบกลับได้";
      }

      return replyText;
    } catch (err: any) {
      const errorMsg =
        err?.data?.detail || err?.message || "เกิดข้อผิดพลาดในการสื่อสารกับ AI";
      error.value = errorMsg;
      console.error("Send Ollama reply error:", err);
      throw new Error(errorMsg);
    }
  };

  return {
    loading,
    error,
    createSession,
    sendOllamaReply,
  };
};
