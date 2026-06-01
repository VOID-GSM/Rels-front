"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { get } from "@/shared/api";
import { authUrl, authUrls } from "@/shared/api/apiUrls";
import type { OAuthSignInType, UserInfoType } from "@/entities/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const called = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Strict Mode에서 두 번 실행되는 것을 방지
    if (called.current) return;
    called.current = true;

    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code || !state) {
          throw new Error("code 또는 state가 없습니다.");
        }

        const { accessToken } = await get<OAuthSignInType>(
          authUrls.dgCallback(code, state),
        );

        // 토큰을 sessionStorage에 먼저 저장 (axios 인터셉터가 읽을 수 있게)
        sessionStorage.setItem("accessToken", accessToken);

        const user = await get<UserInfoType>(authUrl.getUserInfo());

        setAuth(accessToken, user);

        router.replace("/");
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "알 수 없는 오류가 발생했습니다.";
        setError(message);
        timerRef.current = setTimeout(() => router.replace("/"), 3000);
      }
    };

    handleCallback();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchParams, setAuth, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#191919]">
        <p className="text-red-400 text-lg font-semibold mb-2">로그인 오류</p>
        <p className="text-white/70 text-sm text-center px-4">{error}</p>
        <p className="text-white/40 text-xs mt-4">3초 후 홈으로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#191919]">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
      <p className="text-white/60 text-sm">로그인 처리 중...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#191919]">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
