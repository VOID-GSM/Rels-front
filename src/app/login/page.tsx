"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { get } from "@/shared/api";
import { authUrl, authUrls } from "@/shared/api/apiUrls";
import { getOAuthRedirectUri } from "@/shared/lib/getOAuthRedirectUri";
import type { UserInfoType } from "@/entities/auth";

/** 왼쪽에서 5초마다 돌아가는 소개 문구입니다. */
const SLIDES = [
  {
    title: "릴레이 스터디, Rels",
    description:
      "광주소프트웨어마이스터고 학생이 직접 강연을 열고 신청하는 곳입니다.",
  },
  {
    title: "강연 개설",
    description:
      "주제와 장소, 일정, 정원을 정해 등록하면 신청자 명단을 확인할 수 있습니다.",
  },
  {
    title: "강연 신청",
    description: "열려 있는 강연을 둘러보고 신청 마감 시간 전까지 신청합니다.",
  },
];

const SLIDE_INTERVAL = 5000;

export default function LoginPage() {
  const router = useRouter();
  const { initFromSession, clearAuth, setUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

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
        // 이 요청 도중 토큰이 재발급됐을 수 있으므로 token을 다시 쓰지 않습니다.
        // 저장은 인터셉터가 이미 끝냈고, 여기서는 유저 정보만 채웁니다.
        setUser(user);
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
  }, [initFromSession, clearAuth, setUser, router]);

  // 자동 전환은 장식일 뿐이라 모션을 줄인 사용자에게는 돌리지 않습니다.
  useEffect(() => {
    if (isChecking) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(
      () => setSlideIndex((index) => (index + 1) % SLIDES.length),
      SLIDE_INTERVAL,
    );

    return () => window.clearInterval(timer);
  }, [isChecking]);

  const handleLogin = useCallback(() => {
    window.location.href = authUrls.dgStart(getOAuthRedirectUri());
  }, []);

  if (isChecking) {
    return null;
  }

  const slide = SLIDES[slideIndex];

  return (
    <main className="relative min-h-dvh overflow-hidden bg-canvas">
      {/* 배경은 경계선 없이 천천히 움직이는 빛만 깔립니다. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="animate-drift absolute -top-48 -left-40 h-[32rem] w-[32rem] rounded-full bg-main/25 blur-3xl" />
        <div className="animate-drift absolute top-1/4 -right-52 h-[38rem] w-[38rem] rounded-full bg-main-100/45 blur-3xl [animation-delay:-8s]" />
        <div className="animate-drift absolute -bottom-56 left-1/3 h-[30rem] w-[30rem] rounded-full bg-main-soft blur-3xl [animation-delay:-16s]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col justify-center gap-14 px-6 py-16 lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-center lg:gap-24 lg:px-10">
        <section className="flex flex-col gap-10">
          <div className="flex items-center gap-2.5">
            <Image
              src="/img/Rels.png"
              alt=""
              width={34}
              height={34}
              priority
              className="rounded-lg"
            />
            <span className="text-lg font-bold text-gray-900">Rels</span>
          </div>

          {/* key가 바뀌면 등장 애니메이션이 다시 돕니다. */}
          <div
            key={slideIndex}
            className="animate-rise flex flex-col gap-4 lg:min-h-[11rem]"
          >
            <h1 className="text-4xl leading-tight font-bold text-gray-900 lg:text-5xl">
              {slide.title}
            </h1>
            <p className="max-w-[26rem] text-base leading-relaxed text-gray-600">
              {slide.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {SLIDES.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setSlideIndex(index)}
                aria-label={`${index + 1}번째 소개 보기`}
                aria-current={index === slideIndex}
                className="focusable group flex h-4 items-center"
              >
                {index === slideIndex ? (
                  <span className="block h-1.5 w-10 overflow-hidden rounded-full bg-gray-900/10">
                    <span
                      key={slideIndex}
                      className="animate-sweep block h-full w-full rounded-full bg-main"
                    />
                  </span>
                ) : (
                  <span className="block h-1.5 w-1.5 rounded-full bg-gray-900/20 transition-colors group-hover:bg-gray-900/40" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="animate-rise flex w-full max-w-[400px] flex-col gap-7 rounded-3xl bg-surface p-8 shadow-e3 lg:justify-self-end">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              따로 가입할 필요 없어요.
              <br />
              DataGSM 계정이면 1분도 걸리지 않습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="focusable flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-main text-sm font-semibold text-gray-900 transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-e2"
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
      </div>
    </main>
  );
}
