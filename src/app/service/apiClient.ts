export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
};

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  let data: any = {};
  try {
    const text = await res.text();
    if (text) {
      data = JSON.parse(text);
    }
  } catch (error) {
    console.error("Error parsing JSON response:", error);
  }
  if (!res.ok) {
    return {
      success: false,
      message: data.message || "Something went wrong",
      error: data,
    };
  }
  return {
    success: true,
    data: data.data !== undefined ? data.data : data,
    message: data.message,
  };
}

export const apiClient = {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(url);
      return await handleResponse<T>(res);
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      return { success: false, message: "Network error" };
    }
  },

  async post<T>(url: string, payload: any): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await handleResponse<T>(res);
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      return { success: false, message: "Network error" };
    }
  },

  async put<T>(url: string, payload: any): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await handleResponse<T>(res);
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      return { success: false, message: "Network error" };
    }
  },

  async delete<T>(url: string, payload?: any): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(url, {
        method: "DELETE",
        ...(payload && {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      });
      return await handleResponse<T>(res);
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      return { success: false, message: "Network error" };
    }
  },
  async uploadFile<T>(url: string, file: File): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      return await handleResponse<T>(res);
    } catch (error) {
      console.error(`UPLOAD ${url} failed:`, error);
      return { success: false, message: "Network error" };
    }
  },
};
