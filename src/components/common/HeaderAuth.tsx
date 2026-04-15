"use client";

import useAuthStore from "@/stores/authStore";
import { authUrls } from "@/shared/api/apiUrls";

export default function HeaderAuth() {
  const { isLoggedIn } = useAuthStore();

  const handleLogin = () => {
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/callback`;
    window.location.href = authUrls.dgStart(redirectUri);
  };

  if (isLoggedIn) return null;

  return (
    <button onClick={handleLogin} className="font-medium">
      로그인
    </button>
  );
}
