// Types สำหรับ Response
interface FileItem {
  files_id: string;
  original_filename: string;
  size_bytes: number;
  mime: string;
  channel_id: string;
  public_url: string;
  created_at: string;
}

interface ListFilesResponse {
  files: FileItem[];
}

interface UploadResponse {
  files: FileItem[];
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

export const useFileChannel = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const authStore = useAuthStore();
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Helper Function สำหรับยิง API (เลียนแบบ useChannel) ---
  const request = async <T = any>(endpoint: string, options: any = {}) => {
    loading.value = true;
    error.value = null; // เพิ่มการเคลียร์ error ก่อนเริ่ม request
    try {
      return await $fetch<T>(endpoint, {
        baseURL: apiBase,
        ...options,
        headers: {
          Authorization: authStore.token ? `Bearer ${authStore.token}` : "",
          ...options.headers,
        },
      });
    } catch (err: any) {
      const errorMessage =
        err?.data?.message || err?.message || "เกิดข้อผิดพลาด";
      error.value = errorMessage;
      console.error("API Error:", errorMessage, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // --- File Operations ---

  /**
   * ดึงรายการไฟล์ในแชนแนล
   * GET /files/list/{channel_id}
   */
  const listFiles = (channelId: string) => {
    if (!channelId) throw new Error("กรุณาระบุ Channel ID");

    return request<ListFilesResponse>(`/files/list/${channelId}`, {
      method: "GET",
    });
  };

  /**
   * อัปโหลดไฟล์แบบ Multipart
   * POST /files/upload
   */
  const uploadFiles = (channelId: string, files: File[]) => {
    if (!files || files.length === 0) {
      throw new Error("กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์");
    }

    const formData = new FormData();
    formData.append("channel_id", channelId);
    files.forEach((file) => formData.append("files", file));

    return request<UploadResponse>("/files/upload", {
      method: "POST",
      body: formData,
    });
  };

  /**
   * ลบไฟล์ตามไอดี
   * DELETE /files/delete/{id}
   */
  const deleteFile = (fileId: string) => {
    if (!fileId) throw new Error("กรุณาระบุ File ID");

    return request<DeleteResponse>(`/files/delete/${fileId}`, {
      method: "DELETE",
    });
  };

  // เพิ่มใน useFileChannel ในไฟล์เดิม
  const downLoadFile = async (fileHash: string, fileName: string) => {
    try {
      const response = await $fetch<Blob>(`/files/download/${fileHash}`, {
        baseURL: apiBase,
        method: "GET",
        headers: {
          Authorization: authStore.token ? `Bearer ${authStore.token}` : "",
        },
        responseType: "blob", // สำคัญมาก: เพื่อให้ได้ข้อมูลเป็นไฟล์
      });

      // สร้าง Link เพื่อดาวน์โหลดไฟล์
      const url = window.URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // ตั้งชื่อไฟล์ที่จะบันทึก
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const errorMessage = "ไม่สามารถดาวน์โหลดไฟล์ได้";
      error.value = errorMessage;
      console.error("Download Error:", err);
      throw err;
    }
  };

  // --- Utility ---

  const clearError = () => {
    error.value = null;
  };

  return {
    loading,
    error,
    // Methods
    listFiles,
    uploadFiles,
    deleteFile,
    clearError,
    downLoadFile,
  };
};
