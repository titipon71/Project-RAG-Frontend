export const useApiKeys = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const authStore = useAuthStore();
  const loading = ref(false);

  const getHeaders = () => ({
    Authorization: authStore.token ? `Bearer ${authStore.token}` : "",
  });

  // สร้าง Key: ส่ง name และ channel_id เป็น string
  const createApi = async (payload: { name: string; channel_id: string }) => {
    loading.value = true;
    try {
      return await $fetch<any>(`${apiBase}/auth/api-keys`, {
        method: "POST",
        headers: getHeaders(),
        body: payload,
      });
    } finally {
      loading.value = false;
    }
  };

  // ดึงรายการ: คืนค่า Array ของ Key Object
  const listApiKeys = async () => {
    loading.value = true;
    try {
      return await $fetch<any[]>(`${apiBase}/auth/api-keys/list`, {
        method: "GET",
        headers: getHeaders(),
      });
    } finally {
      loading.value = false;
    }
  };

  // ยกเลิก Key: บังคับส่ง key_id เป็นตัวเลข (Integer) ตาม Docs
  const revokeApiKey = async (keyId: number) => {
    loading.value = true;
    try {
      return await $fetch<any>(`${apiBase}/auth/api-keys/revoke`, {
        method: "POST",
        headers: getHeaders(),
        body: {
          key_id: keyId, // ต้องเป็นเลขเท่านั้น
        },
      });
    } finally {
      loading.value = false;
    }
  };

  return { createApi, listApiKeys, revokeApiKey, loading };
};
