"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { authUrls } from "@/shared/api/apiUrls";
import { getOAuthRedirectUri } from "@/shared/lib/getOAuthRedirectUri";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, initFromSession } = useAuthStore();

  useEffect(() => {
    const token = initFromSession();
    if (token || isLoggedIn) {
      router.replace("/");
    }
  }, [initFromSession, isLoggedIn, router]);

  const handleLogin = () => {
    window.location.href = authUrls.dgStart(getOAuthRedirectUri());
  };

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
