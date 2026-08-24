import axios from "axios";
import useAuthStore from "@/stores/authStore";

// 토큰 유효성 자체를 확인하는 경로. 이 경로의 403만 세션 만료로 취급합니다.
const AUTH_VERIFY_PATH = "/api/auth/me";

// 자체 에러 처리를 하는 화면이므로 인터셉터가 강제 이동시키지 않습니다.
const REDIRECT_EXEMPT_PATHS = ["/login", "/callback"];

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

// 세션 만료 시 토큰 삭제 후 로그인 페이지로 이동 (자동 로그아웃)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string = error.config?.url ?? "";

    // 백엔드는 인증 실패에도 401이 아닌 403을 반환합니다.
    // 403은 권한 부족에도 쓰이므로, 토큰 유효성을 확인하는 경로의 403만
    // 만료로 판정해 정상 권한 오류로 로그아웃되는 것을 막습니다.
    const isSessionExpired =
      status === 401 ||
      (status === 403 && requestUrl.startsWith(AUTH_VERIFY_PATH));

    if (isSessionExpired && sessionStorage.getItem("accessToken")) {
      useAuthStore.getState().clearAuth();

      const isExempt = REDIRECT_EXEMPT_PATHS.some((path) =>
        window.location.pathname.startsWith(path),
      );
      if (!isExempt) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
