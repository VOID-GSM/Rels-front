"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { get } from "@/shared/api";
import { authUrl, authUrls } from "@/shared/api/apiUrls";
import { getOAuthRedirectUri } from "@/shared/lib/getOAuthRedirectUri";
import type { UserInfoType } from "@/entities/auth";

export default function LoginPage() {
  const router = useRouter();
  const { initFromSession, clearAuth, setAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // sessionStorage에 토큰이 남아 있어도 만료됐을 수 있습니다.
    // 검증 없이 홈으로 보내면 만료 토큰일 때 홈과 로그인 사이에 갇히므로
    // /api/auth/me로 확인한 뒤에만 이동합니다.
    const verifySession = async () => {
      const token = initFromSession();

      if (!token) {
        if (isMounted) setIsChecking(false);
        return;
      }

      try {
        const user = await get<UserInfoType>(authUrl.getUserInfo());
        setAuth(token, user);
        router.replace("/");
      } catch {
        clearAuth();
        if (isMounted) setIsChecking(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [initFromSession, clearAuth, setAuth, router]);

  const handleLogin = () => {
    window.location.href = authUrls.dgStart(getOAuthRedirectUri());
  };

  if (isChecking) {
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-main-100/50">
      <section className="w-full max-w-[430px] flex flex-col items-center gap-6 bg-white rounded-2xl p-8 shadow-2xl">
        <Image src="/img/Rels.png" alt="Rels" width={82} height={82} priority />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-black">Rels 로그인</h1>
          <p className="text-sm text-black/55">
            DataGSM 계정으로 로그인한 뒤 강연 목록을 확인할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogin}
          className="w-full h-11 rounded-lg bg-black text-white text-sm font-semibold text-center flex items-center justify-center gap-3 hover:bg-black/90 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M0 0V14H10V12H12V10H14V4H12V2H10V0H0ZM4 2H8V4H10V10H8V12H4V2Z"
              fill="white"
            />
          </svg>
          DataGSM 계정으로 로그인
        </button>
      </section>
    </main>
  );
}
