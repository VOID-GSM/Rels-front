"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useAuthStore from "@/stores/authStore";
import { useGetUserInfo } from "@/entities/auth";
import More from "@/assets/svg/More";
import Cancel from "@/assets/svg/Cancel";

export default function Header() {
  const { isLoggedIn, setUser, initFromSession } = useAuthStore();
  const { data: fetchedUser } = useGetUserInfo();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const navLinks = (
    <>
      <Link
        href="/notification"
        className="rounded-md px-3 py-2 font-medium transition-colors hover:bg-main-100 md:px-0 md:py-0 md:hover:bg-transparent"
      >
        공지사항
      </Link>
      <Link
        href="/mypage"
        className="rounded-md px-3 py-2 font-medium transition-colors hover:bg-main-100 md:px-0 md:py-0 md:hover:bg-transparent"
      >
        마이페이지
      </Link>
    </>
  );

  return (
    <>
      <header className="mx-auto flex h-[70px] w-full max-w-[1920px] items-center justify-between border-b border-main-300 px-4 sm:px-8 lg:px-20 xl:px-68">
        <Link href="/">
          <Image src="/img/Rels.png" alt="logo" width={50} height={50} />
        </Link>
        {isLoggedIn && (
          <>
            <nav className="hidden items-center gap-4 md:flex">{navLinks}</nav>
            <button
              type="button"
              aria-label="메뉴 열기"
              aria-expanded={isSidebarOpen}
              aria-controls="mobile-sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="flex md:hidden"
            >
              <More />
            </button>
          </>
        )}
      </header>

      {isLoggedIn && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-black/35 transition-opacity md:hidden ${
              isSidebarOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside
            id="mobile-sidebar"
            className={`fixed right-0 top-0 z-50 flex h-dvh w-[260px] max-w-[82vw] flex-col bg-white transition-transform duration-200 md:hidden ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex h-[70px] items-center justify-between border-b border-main-300 px-4">
              <Image src="/img/Rels.png" alt="logo" width={42} height={42} />
              <button
                type="button"
                aria-label="메뉴 닫기"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center justify-center leading-none"
              >
                <Cancel />
              </button>
            </div>
            <nav
              className="flex flex-col gap-1 px-4 py-4"
              onClick={() => setIsSidebarOpen(false)}
            >
              {navLinks}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
