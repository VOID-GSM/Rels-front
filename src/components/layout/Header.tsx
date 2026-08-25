"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useAuthStore from "@/stores/authStore";
import { useGetUserInfo } from "@/entities/auth";
import More from "@/assets/svg/More";
import Cancel from "@/assets/svg/Cancel";
import Download from "@/assets/svg/Download";

export default function Header() {
  const { isLoggedIn, setUser, user } = useAuthStore();
  const pathname = usePathname();
  const { data: fetchedUser } = useGetUserInfo();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const showNav = isLoggedIn;

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

  // 강연 승인은 학생회만 씁니다. /lectures 보다 앞에 두면 강연 흐름이 이어집니다.
  const NAV_ITEMS = [
    { href: "/", label: "이번 주" },
    { href: "/lectures", label: "전체 강연" },
    ...(user?.role === "ADMIN"
      ? [{ href: "/lectures/pending", label: "강연 승인" }]
      : []),
    { href: "/notification", label: "공지사항" },
    { href: "/mypage", label: "마이페이지" },
    { href: "/pwa-install", label: "앱 설치 안내" },
  ];

  // "/"는 정확히 일치할 때만 현재 위치로 봅니다. 아니면 모든 경로에서 켜집니다.
  const isCurrent = (href: string) => {
    if (href === "/") return pathname === "/";
    // /lectures 가 /lectures/pending 에서도 켜지면 현재 위치가 두 개로 보입니다.
    if (href === "/lectures") return pathname?.startsWith("/lectures") && !pathname.startsWith("/lectures/pending");
    return pathname?.startsWith(href);
  };

  // 가로 네비는 회색 알약 대신 밑줄로 현재 위치를 표시합니다. 흰 헤더 위의
  // 회색 면은 탁해 보이고, 밑줄은 브랜드 색을 쓸 수 있습니다.
  const topNavClass = (href: string) =>
    `focusable relative rounded-lg px-3 py-2 text-sm transition-colors ${
      isCurrent(href)
        ? "font-semibold text-gray-900 after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:rounded-full after:bg-main"
        : "font-medium text-gray-500 hover:text-gray-900"
    }`;

  // 세로 목록에서는 밑줄이 어색해서 왼쪽 막대로 표시합니다.
  const sideNavClass = (href: string) =>
    `focusable relative rounded-lg py-2.5 pl-4 pr-3 text-sm transition-colors ${
      isCurrent(href)
        ? "font-semibold text-gray-900 before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-main"
        : "font-medium text-gray-500 hover:text-gray-900"
    }`;

  const navLinks = NAV_ITEMS.map((item) => (
    <Link key={item.href} href={item.href} className={topNavClass(item.href)}>
      {item.label}
    </Link>
  ));

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface/75 shadow-e1 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between px-6 md:px-10 xl:px-16">
          <Link
            href="/"
            className="focusable flex items-center gap-2 rounded-lg"
            aria-label="Rels 홈"
          >
            <Image
              src="/img/Rels.png"
              alt=""
              width={34}
              height={34}
              priority
            />
            <span className="text-lg font-bold tracking-[-0.02em] text-gray-900">
              Rels
            </span>
          </Link>
          {showNav && (
            <>
              <nav className="hidden items-center gap-0.5 md:flex">{navLinks}</nav>
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
            <div className="flex h-[68px] items-center justify-between px-5">
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
              {NAV_ITEMS.filter((item) => item.href !== "/pwa-install").map(
                (item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={sideNavClass(item.href)}
                  >
                    {item.label}
                  </Link>
                ),
              )}
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
