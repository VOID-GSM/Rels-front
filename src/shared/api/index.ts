import axiosInstance from "@/shared/lib/axios";

// 클라이언트 전용: axios 인스턴스를 사용한 HTTP 메서드 래퍼
// withCredentials: true로 httpOnly 쿠키가 자동 전송됨

export const get = <T>(url: string): Promise<T> => {
  return axiosInstance.get<T>(url).then((res) => res.data);
};

export const post = <T, D = unknown>(url: string, data?: D): Promise<T> => {
  return axiosInstance.post<T>(url, data).then((res) => res.data);
};

export const patch = <T, D = unknown>(url: string, data?: D): Promise<T> => {
  return axiosInstance.patch<T>(url, data).then((res) => res.data);
};

export const del = <T>(url: string): Promise<T> => {
  return axiosInstance.delete<T>(url).then((res) => res.data);
};
