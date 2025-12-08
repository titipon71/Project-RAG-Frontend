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
          // จริง ๆ ไม่ใส่ก็ได้ $fetch จะใส่ให้เองถ้า body เป็น object
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

  const updateChannel = async (id: number, payload: any) => {
    return await $fetch(`${apiBase}/channels/${id}`, {
      method: "PUT",
      body: payload,
    });
  };

  const deleteChannel = async (id: number) => {
    loading.value = true;
    try {
      return await $fetch(`${apiBase}/channels/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          // จริง ๆ ไม่ใส่ก็ได้ $fetch จะใส่ให้เองถ้า body เป็น object
          "Content-Type": "application/json",
          credentials: "include",
        },
      });
    } finally {
      loading.value = false;
    }
  };

  return {
    fetchChannels,
    createChannel,
    updateChannel,
    deleteChannel,
    loading,
  };
};
