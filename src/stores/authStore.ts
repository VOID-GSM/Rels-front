import { create } from "zustand";
import type { UserInfoType } from "@/entities/auth/model/types";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/shared/lib/tokenStorage";

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
  syncFromStorage: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isSessionChecked: false,
  user: null,
  accessToken: null,
  refreshToken: null,

  setTokens: (accessToken, refreshToken) => {
    saveTokens(accessToken, refreshToken);
    set({
      isLoggedIn: true,
      isSessionChecked: true,
      accessToken,
      refreshToken,
    });
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    clearTokens();
    set({
      isLoggedIn: false,
      isSessionChecked: true,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  initFromSession: () => {
    const token = getAccessToken();
    set(
      token
        ? {
            isLoggedIn: true,
            isSessionChecked: true,
            accessToken: token,
            refreshToken: getRefreshToken(),
          }
        : { isSessionChecked: true },
    );
    return token;
  },

  /**
   * 다른 탭에서 로그인·로그아웃·재발급이 일어났을 때 이 탭을 맞춥니다.
   * 토큰이 사라졌으면 여기서도 로그아웃 상태로 내려야 AuthGuard가 화면을 접습니다.
   * 저장소를 이미 반영한 결과를 읽는 것이라 clearAuth 대신 상태만 바꿉니다.
   */
  syncFromStorage: () => {
    const token = getAccessToken();
    set(
      token
        ? {
            isLoggedIn: true,
            isSessionChecked: true,
            accessToken: token,
            refreshToken: getRefreshToken(),
          }
        : {
            isLoggedIn: false,
            isSessionChecked: true,
            user: null,
            accessToken: null,
            refreshToken: null,
          },
    );
  },
}));

export default useAuthStore;
