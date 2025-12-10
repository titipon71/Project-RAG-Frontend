export const useChannel = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const loading = ref(false);

  const authStore = useAuthStore();
  const token = authStore.token;

  const fetchChannels = async () => {
    loading.value = true;
    try {
      return await $fetch(`${apiBase}/channels/list/`, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
    } finally {
      loading.value = false;
    }
  };

  const createChannel = async (payload: {
    title: string;
    description: string | null;
  }) => {
    loading.value = true;
    try {
      const res: any = await $fetch(`${apiBase}/channels`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: {
          title: payload.title,
          description: payload.description ?? "",
        },
      });

      // ดึง id ที่ backend ส่งมา
      return res.channels_id;
    } finally {
      loading.value = false;
    }
  };

  const updateChannel = async (
    id: number,
    payload: { title: string; description?: string | null }
  ) => {
    loading.value = true;
    try {
      // const token = useCookie<string | null>("access_token").value;

      return await $fetch(`${apiBase}/channels/${id}`, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: {
          title: payload.title,
          description: payload.description ?? "",
        },
        credentials: "include",
      });
    } finally {
      loading.value = false;
    }
  };

  const deleteChannel = async (id: number) => {
    loading.value = true;
    try {
      return await $fetch(`${apiBase}/channels/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
          credentials: "include",
        },
      });
    } finally {
      loading.value = false;
    }
  };

  const statusChannel = async (
    id: number,
    payload: {
      approve: boolean;
      reason: string | null;
    }
  ) => {
    // 1. เลือก Action ตามสถานะ: ถ้า approve=true ไป public, ถ้า false ไป private
    const action = payload.approve
      ? "admin-forced-public"
      : "admin-forced-private";

    console.log(`Updating status for Channel ID: ${id} to ${action}`);

    return await $fetch(`${apiBase}/channels/${id}/${action}`, {
      // 2. ใส่ตัวแปร action ลงใน URL
      method: "POST",
      headers: {
        // แนะนำให้เรียก authStore.token ตรงนี้เพื่อให้ได้ Token ล่าสุดเสมอ
        Authorization: authStore.token ? `Bearer ${authStore.token}` : "",
        "Content-Type": "application/json",
      },
      body: {
        // ⚠️ จุดสังเกต: API แนว "Forced" มักจะต้องการ approve: true เพื่อยืนยันคำสั่งเสมอ
        // ไม่ว่าจะเป็นการ Force Public หรือ Force Private
        // ผมจึงตั้งเป็น true ไว้ (เพราะเราเลือก endpoint ที่ถูกต้องแล้ว)
        approve: payload.approve,

        reason: payload.reason ?? "",
      },
    });
  };

  return {
    fetchChannels,
    createChannel,
    updateChannel,
    deleteChannel,
    statusChannel,
    loading,
  };
};
