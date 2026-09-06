import axios, { type InternalAxiosRequestConfig } from "axios";
import useAuthStore from "@/stores/authStore";
import { getAccessToken, getRefreshToken } from "@/shared/lib/tokenStorage";
import type { OAuthSignInType } from "@/entities/auth/model/types";

// 토큰 유효성 자체를 확인하는 경로. 이 경로의 403만 세션 만료로 취급합니다.
const AUTH_VERIFY_PATH = "/api/auth/me";

// 변경 시 shared/api/apiUrls.ts의 authUrl.refresh도 함께 수정해야 합니다.
const REFRESH_PATH = "/api/auth/refresh";

// 자체 에러 처리를 하는 화면이므로 인터셉터가 강제 이동시키지 않습니다.
const REDIRECT_EXEMPT_PATHS = ["/login", "/callback"];

// 한 요청당 재발급은 한 번만 시도합니다.
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

const axiosInstance = axios.create({
  baseURL: "/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청마다 저장된 accessToken을 Authorization 헤더에 자동 주입
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 재발급 호출은 인터셉터를 달지 않은 별도 인스턴스로 보냅니다.
// 재발급 자체가 401/403으로 실패했을 때 다시 재발급을 시도하는 무한 루프를 막습니다.
const refreshClient = axios.create({
  baseURL: "/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 백엔드는 재발급할 때 refreshToken도 새로 발급하고 기존 것을 폐기합니다(회전).
// 동시에 만료를 맞은 요청들이 각자 재발급을 부르면 뒤늦은 요청이 이미 폐기된
// refreshToken을 보내 실패하므로, 한 번만 호출하고 그 결과를 함께 기다립니다.
let refreshPromise: Promise<string> | null = null;

const requestNewToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("refreshToken이 없습니다.");
  }

  const { data } = await refreshClient.post<OAuthSignInType>(REFRESH_PATH, {
    refreshToken,
  });

  useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
};

const refreshAccessToken = () => {
  refreshPromise ??= requestNewToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

// 세션 만료 시 재발급을 시도하고, 실패하면 토큰 삭제 후 로그인 페이지로 이동
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config as RetriableConfig | undefined;
    const requestUrl: string = config?.url ?? "";

    // 백엔드는 인증 실패에도 401이 아닌 403을 반환합니다.
    // 403은 권한 부족에도 쓰이므로, 토큰 유효성을 확인하는 경로의 403만
    // 만료로 판정해 정상 권한 오류로 로그아웃되는 것을 막습니다.
    const isSessionExpired =
      status === 401 ||
      (status === 403 && requestUrl.startsWith(AUTH_VERIFY_PATH));

    if (!isSessionExpired || !getAccessToken()) {
      return Promise.reject(error);
    }

    // 만료된 accessToken은 refreshToken으로 되살릴 수 있습니다.
    // 재발급에 성공하면 원래 요청을 새 토큰으로 한 번 더 보냅니다.
    if (config && !config._retried && getRefreshToken()) {
      config._retried = true;

      try {
        const accessToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${accessToken}`;
        return await axiosInstance(config);
      } catch {
        // 재발급도 실패했다면 되살릴 수 없는 세션이므로 아래에서 로그아웃합니다.
      }
    }

    useAuthStore.getState().clearAuth();

    const isExempt = REDIRECT_EXEMPT_PATHS.some((path) =>
      window.location.pathname.startsWith(path),
    );
    if (!isExempt) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
