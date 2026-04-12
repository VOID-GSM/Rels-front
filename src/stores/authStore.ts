import { create } from "zustand";
import type { UserInfoType } from "@/entities/auth/model/types";

const SESSION_KEY = "accessToken";

interface AuthState {
  isLoggedIn: boolean;
  user: UserInfoType | null;
  accessToken: string | null;
  // 로그인 성공 시 호출: 토큰 + 유저 정보 저장
  setAuth: (accessToken: string, user: UserInfoType) => void;
  // 로그아웃 시 호출: 상태 + sessionStorage 초기화
  clearAuth: () => void;
  // 새로고침 후 sessionStorage에서 토큰 복원
  initFromSession: () => string | null;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  accessToken: null,

  setAuth: (accessToken, user) => {
    sessionStorage.setItem(SESSION_KEY, accessToken);
    set({ isLoggedIn: true, user, accessToken });
  },

  clearAuth: () => {
    sessionStorage.removeItem(SESSION_KEY);
    set({ isLoggedIn: false, user: null, accessToken: null });
  },

  initFromSession: () => {
    const token = sessionStorage.getItem(SESSION_KEY);
    if (token) {
      set({ isLoggedIn: true, accessToken: token });
    }
    return token;
  },
}));

export default useAuthStore;
