"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { get } from "@/shared/api";
import { authUrl, authUrls } from "@/shared/api/apiUrls";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import type { OAuthSignInType, UserInfoType } from "@/entities/auth";

// 토큰 교환은 백엔드가 DataGSM과 서버-투-서버 통신 후 유저 프로비저닝까지 하므로
// 전역 10초 타임아웃으로는 부족합니다. 이 요청에만 넉넉한 값을 적용합니다.
const OAUTH_EXCHANGE_TIMEOUT_MS = 60000;

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, clearAuth } = useAuthStore();
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
          { timeout: OAUTH_EXCHANGE_TIMEOUT_MS },
        );

        // 토큰을 sessionStorage에 먼저 저장 (axios 인터셉터가 읽을 수 있게)
        sessionStorage.setItem("accessToken", accessToken);

        const user = await get<UserInfoType>(authUrl.getUserInfo());

        setAuth(accessToken, user);

        router.replace("/");
      } catch (err) {
        // 실패 시 절반만 저장된 토큰이 남지 않도록 정리
        clearAuth();

        setError(
          getApiErrorMessage(err, {
            timeout:
              "로그인 처리가 지연되어 시간이 초과되었습니다. 다시 시도해주세요.",
            statusMessages: {
              // 인증 코드는 일회용이라 만료되거나 이미 사용되면 재시도할 수 없습니다.
              400: "인증 정보가 만료되었습니다. 다시 로그인해주세요.",
              403: "계정 정보를 확인할 수 없습니다. 다시 로그인해주세요.",
              // 백엔드가 응답은 했지만 로그인 처리를 끝내지 못한 경우입니다.
              500: "로그인 처리 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
              // 백엔드가 DataGSM 인증 서버와 통신하지 못한 경우입니다.
              502: "인증 서버와 연결하지 못했습니다. 잠시 후 다시 시도해주세요.",
              504: "인증 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
            },
          }),
        );

        // 로그인 재시도 동선을 위해 홈이 아닌 로그인 페이지로 보냅니다.
        timerRef.current = setTimeout(() => router.replace("/login"), 3000);
      }
    };

    handleCallback();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchParams, setAuth, clearAuth, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#191919]">
        <p className="text-red-400 text-lg font-semibold mb-2">로그인 오류</p>
        <p className="text-white/70 text-sm text-center px-4">{error}</p>
        <p className="text-white/40 text-xs mt-4">
          3초 후 로그인 페이지로 이동합니다...
        </p>
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
