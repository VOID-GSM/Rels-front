import { create } from "zustand";
import type { UserInfoType } from "@/entities/auth/model/types";

const SESSION_KEY = "accessToken";

interface AuthState {
  isLoggedIn: boolean;
  /** initFromSession이 한 번이라도 돌았는지. 세션 복원 전과 비로그인을 구분합니다. */
  isSessionChecked: boolean;
  user: UserInfoType | null;
  accessToken: string | null;
  setAuth: (accessToken: string, user: UserInfoType) => void;
  setUser: (user: UserInfoType) => void;
  clearAuth: () => void;
  initFromSession: () => string | null;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isSessionChecked: false,
  user: null,
  accessToken: null,

  setAuth: (accessToken, user) => {
    sessionStorage.setItem(SESSION_KEY, accessToken);
    set({ isLoggedIn: true, isSessionChecked: true, user, accessToken });
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    sessionStorage.removeItem(SESSION_KEY);
    set({
      isLoggedIn: false,
      isSessionChecked: true,
      user: null,
      accessToken: null,
    });
  },

  initFromSession: () => {
    const token = sessionStorage.getItem(SESSION_KEY);
    set(
      token
        ? { isLoggedIn: true, isSessionChecked: true, accessToken: token }
        : { isSessionChecked: true },
    );
    return token;
  },
}));

export default useAuthStore;
