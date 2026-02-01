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

  // ฟังก์ชันสำหรับดึง Header (เพื่อลดความซ้ำซ้อนในการเขียน Authorization)
  const getHeaders = () => ({
    Authorization: authStore.token ? `Bearer ${authStore.token}` : "",
  });

  // --- File Operations ---

  /**
   * ดึงรายการไฟล์ในแชนแนล
   * GET /files/list/{channel_id}
   */
  const listFiles = async (channelId: string) => {
    if (!channelId) throw new Error("กรุณาระบุ Channel ID");

    loading.value = true;
    error.value = null;
    try {
      return await $fetch<ListFilesResponse>(
        `${apiBase}/files/list/${channelId}`,
        {
          method: "GET",
          headers: getHeaders(),
        },
      );
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

  /**
   * อัปโหลดไฟล์แบบ Multipart
   * POST /files/upload
   */
  const uploadFiles = async (channelId: string, files: File[]) => {
    if (!files || files.length === 0) {
      throw new Error("กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์");
    }

    const formData = new FormData();
    formData.append("channel_id", channelId);
    files.forEach((file) => formData.append("files", file));

    loading.value = true;
    error.value = null;
    try {
      return await $fetch<UploadResponse>(`${apiBase}/files/upload`, {
        method: "POST",
        headers: getHeaders(),
        body: formData,
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

  /**
   * ลบไฟล์ตามไอดี
   * DELETE /files/delete/{id}
   */
  const deleteFile = async (fileId: string | number) => {
    if (!fileId) throw new Error("กรุณาระบุ File ID");

    loading.value = true;
    error.value = null;
    try {
      await $fetch<DeleteResponse>(`${apiBase}/files/delete/${fileId}`, {
        method: "DELETE",
        headers: getHeaders(),
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

  /**
   * ดาวน์โหลดไฟล์
   * GET /files/download/{fileHash}
   */
  const downLoadFile = async (fileHash: string, fileName: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch<Blob>(
        `${apiBase}/files/download/${fileHash}`,
        {
          method: "GET",
          headers: getHeaders(),
          responseType: "blob", // สำคัญมาก: เพื่อให้ได้ข้อมูลเป็นไฟล์
        },
      );

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
    } finally {
      loading.value = false;
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
    downLoadFile,
    clearError,
  };
};
