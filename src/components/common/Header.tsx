"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import { useGetUserInfo } from "@/entities/auth";
import HeaderAuth from "./HeaderAuth";

export default function Header() {
  const { isLoggedIn, user, setUser, initFromSession } = useAuthStore();
  const { data: fetchedUser } = useGetUserInfo();

  // 새로고침 후 sessionStorage 토큰 복원
  useEffect(() => {
    initFromSession();
  }, [initFromSession]);

  // isLoggedIn 복원 후 useGetUserInfo가 자동 호출되면 user 상태에 반영
  useEffect(() => {
    if (fetchedUser) setUser(fetchedUser);
  }, [fetchedUser, setUser]);

  const isCouncil = user?.role === "ADMIN";

  return (
    <header className="max-w-[1920px] h-[70px] border-b border-main-300 flex items-center justify-between px-50">
      <Link href="/">
        <Image src="/img/Rels.png" alt="logo" width={50} height={50} />
      </Link>
      <div className="flex items-center gap-4">
        {isLoggedIn && isCouncil && (
          <Link href="/notification" className="font-medium">
            공지사항
          </Link>
        )}
        {isLoggedIn && (
          <Link href="/mypage" className="font-medium">
            마이페이지
          </Link>
        )}
        <HeaderAuth />
      </div>
    </header>
  );
}
