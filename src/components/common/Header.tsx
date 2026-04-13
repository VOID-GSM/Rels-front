"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import { useGetUserInfo } from "@/entities/auth";
import HeaderAuth from "./HeaderAuth";

export default function Header() {
  const { isLoggedIn, user, setAuth, initFromSession } = useAuthStore();
  const { data: fetchedUser } = useGetUserInfo();

  // 새로고침 후 sessionStorage 토큰 복원 + 유저 정보 주입
  useEffect(() => {
    const token = initFromSession();
    if (token && fetchedUser) {
      setAuth(token, fetchedUser);
    }
  }, [fetchedUser, initFromSession, setAuth]);

  const isCouncil = user?.student?.role === "STUDENT_COUNCIL";

  return (
    <header className="max-w-[1920px] h-[70px] border-b border-main-300 flex items-center justify-between px-50">
      <Link href="/">
        <Image src="/img/Rels.png" alt="logo" width={50} height={50} />
      </Link>
      <div className="flex items-center gap-4">
        {isLoggedIn && isCouncil && (
          <Link href="/notification" className="font-medium">
            공지 작성
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
