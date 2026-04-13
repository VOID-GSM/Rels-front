"use client";

import useAuthStore from "@/stores/authStore";
import { authUrls } from "@/shared/api/apiUrls";

export default function HeaderAuth() {
  const { isLoggedIn, clearAuth } = useAuthStore();

  const handleLogin = () => {
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/callback`;
    window.location.href = authUrls.dgStart(redirectUri);
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  if (!isLoggedIn) {
    return (
      <button onClick={handleLogin} className="font-medium">
        로그인
      </button>
    );
  }

  return (
    <button onClick={handleLogout} className="font-medium">
      로그아웃
    </button>
  );
}
