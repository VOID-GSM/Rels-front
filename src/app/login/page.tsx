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
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-6">
      <section className="flex w-full max-w-[400px] flex-col items-center gap-7 rounded-2xl bg-surface p-9 shadow-e3">
        <Image src="/img/Rels.png" alt="Rels" width={72} height={72} priority />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Rels</h1>
          <p className="text-sm leading-relaxed text-gray-600">
            DataGSM 계정으로 로그인하면
            <br />
            강연을 개설하고 신청할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogin}
          className="focusable flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gray-900 text-sm font-semibold text-white transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-e3"
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
              fill="currentColor"
            />
          </svg>
          DataGSM 계정으로 로그인
        </button>
      </section>
    </main>
  );
}
