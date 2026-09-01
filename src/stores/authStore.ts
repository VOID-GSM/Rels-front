import { create } from "zustand";
import type { UserInfoType } from "@/entities/auth/model/types";

const SESSION_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

interface AuthState {
  isLoggedIn: boolean;
  /** initFromSession이 한 번이라도 돌았는지. 세션 복원 전과 비로그인을 구분합니다. */
  isSessionChecked: boolean;
  user: UserInfoType | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** 로그인·재발급으로 받은 토큰 쌍을 저장합니다. user는 setUser로 따로 채웁니다. */
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserInfoType) => void;
  clearAuth: () => void;
  initFromSession: () => string | null;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isSessionChecked: false,
  user: null,
  accessToken: null,
  refreshToken: null,

  setTokens: (accessToken, refreshToken) => {
    sessionStorage.setItem(SESSION_KEY, accessToken);
    sessionStorage.setItem(REFRESH_KEY, refreshToken);
    set({
      isLoggedIn: true,
      isSessionChecked: true,
      accessToken,
      refreshToken,
    });
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    set({
      isLoggedIn: false,
      isSessionChecked: true,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  initFromSession: () => {
    const token = sessionStorage.getItem(SESSION_KEY);
    const refreshToken = sessionStorage.getItem(REFRESH_KEY);
    set(
      token
        ? {
            isLoggedIn: true,
            isSessionChecked: true,
            accessToken: token,
            refreshToken,
          }
        : { isSessionChecked: true },
    );
    return token;
  },
}));

export default useAuthStore;
