import { create } from "zustand";
import type { UserInfoType } from "@/entities/auth/model/types";

const SESSION_KEY = "accessToken";

interface AuthState {
  isLoggedIn: boolean;
  user: UserInfoType | null;
  accessToken: string | null;
  setAuth: (accessToken: string, user: UserInfoType) => void;
  setUser: (user: UserInfoType) => void;
  clearAuth: () => void;
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

  setUser: (user) => set({ user }),

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
