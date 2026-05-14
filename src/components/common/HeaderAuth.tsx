"use client";

import useAuthStore from "@/stores/authStore";
import { authUrls } from "@/shared/api/apiUrls";
import { getOAuthRedirectUri } from "@/shared/lib/getOAuthRedirectUri";

export default function HeaderAuth() {
  const { isLoggedIn } = useAuthStore();

  const handleLogin = () => {
    window.location.href = authUrls.dgStart(getOAuthRedirectUri());
  };

  if (isLoggedIn) return null;

  return (
    <button onClick={handleLogin} className="font-medium">
      로그인
    </button>
  );
}
