import axios from "axios";
import useAuthStore from "@/stores/authStore";

const axiosInstance = axios.create({
  baseURL: "/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청마다 sessionStorage의 accessToken을 Authorization 헤더에 자동 주입
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 응답 시 토큰 삭제 후 홈으로 이동 (자동 로그아웃)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hasToken = !!sessionStorage.getItem("accessToken");
      if (hasToken) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
