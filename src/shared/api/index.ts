import type { AxiosRequestConfig } from "axios";
import axiosInstance from "@/shared/lib/axios";

// config로 요청별 옵션(timeout 등)을 덮어쓸 수 있습니다.

export const get = <T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return axiosInstance.get<T>(url, config).then((res) => res.data);
};

export const post = <T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return axiosInstance.post<T>(url, data, config).then((res) => res.data);
};

export const patch = <T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return axiosInstance.patch<T>(url, data, config).then((res) => res.data);
};

export const del = <T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return axiosInstance.delete<T>(url, config).then((res) => res.data);
};
