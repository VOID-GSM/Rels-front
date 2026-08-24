"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useAuthStore from "@/stores/authStore";
import { useGetUserInfo } from "@/entities/auth";
import { useDesignPreview } from "@/shared/lib/useDesignPreview";
import More from "@/assets/svg/More";
import Cancel from "@/assets/svg/Cancel";
import Download from "@/assets/svg/Download";

export default function Header() {
  const { isLoggedIn, setUser, initFromSession } = useAuthStore();
  const { data: fetchedUser } = useGetUserInfo();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // 디자인 작업용 임시 처리: 비로그인 상태에서도 전체 메뉴를 보여줍니다.
  const isPreview = useDesignPreview();
  const showNav = isLoggedIn || isPreview;

  // 새로고침 후 sessionStorage 토큰 복원
  useEffect(() => {
    initFromSession();
  }, [initFromSession]);

  // isLoggedIn 복원 후 useGetUserInfo가 자동 호출되면 user 상태에 반영
  useEffect(() => {
    if (fetchedUser) setUser(fetchedUser);
  }, [fetchedUser, setUser]);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  const sharedNavLinkClass =
    "focusable rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900";

  const navLinks = (
    <>
      {/* 디자인 시안 비교용 임시 링크 (작업 종료 후 제거) */}
      {isPreview && (
        <Link href="/this-week" className={sharedNavLinkClass}>
          이번 주 시안
        </Link>
      )}
      <Link href="/notification" className={sharedNavLinkClass}>
        공지사항
      </Link>
      <Link href="/mypage" className={sharedNavLinkClass}>
        마이페이지
      </Link>
      <Link href="/pwa-install" className={sharedNavLinkClass}>
        앱 설치 안내
      </Link>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface/80 shadow-e1 backdrop-blur-md">
        <div className="mx-auto flex h-[70px] w-full max-w-[1440px] items-center justify-between px-6 md:px-10 xl:px-16">
          <Link href="/" className="focusable rounded-lg" aria-label="Rels 홈">
            <Image
              src="/img/Rels.png"
              alt="Rels"
              width={44}
              height={44}
              priority
            />
          </Link>
          {showNav && (
            <>
              <nav className="hidden items-center gap-1 md:flex">{navLinks}</nav>
              <button
                type="button"
                aria-label="메뉴 열기"
                aria-expanded={isSidebarOpen}
                aria-controls="mobile-sidebar"
                onClick={() => setIsSidebarOpen(true)}
                className="focusable flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
              >
                <More />
              </button>
            </>
          )}
        </div>
      </header>

      {showNav && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-gray-900/25 backdrop-blur-[2px] transition-opacity md:hidden ${
              isSidebarOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside
            id="mobile-sidebar"
            className={`fixed right-0 top-0 z-50 flex h-dvh w-[268px] max-w-[82vw] flex-col rounded-l-2xl bg-surface shadow-e4 transition-transform duration-200 md:hidden ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex h-[70px] items-center justify-between px-5">
              <Image src="/img/Rels.png" alt="Rels" width={38} height={38} />
              <button
                type="button"
                aria-label="메뉴 닫기"
                onClick={() => setIsSidebarOpen(false)}
                className="focusable flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
              >
                <Cancel />
              </button>
            </div>
            <nav
              className="flex flex-col gap-0.5 px-3 py-2"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Link href="/notification" className={sharedNavLinkClass}>
                공지사항
              </Link>
              <Link href="/mypage" className={sharedNavLinkClass}>
                마이페이지
              </Link>
            </nav>
            <div className="mt-auto p-3">
              <Link
                href="/pwa-install"
                onClick={() => setIsSidebarOpen(false)}
                className="focusable flex w-full items-center gap-2 rounded-xl bg-main-100 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-main"
              >
                <Download />앱 설치 안내
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
