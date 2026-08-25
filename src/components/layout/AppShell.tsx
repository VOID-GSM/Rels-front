"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "./Header";
import AuthGuard, { isPublicPath } from "./AuthGuard";

const NoticeBanner = dynamic(() => import("./NoticeBanner"), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // 로그인·콜백은 헤더 없이 화면 전체를 씁니다.
  const isFullScreen = isPublicPath(pathname);

  return (
    <AuthGuard>
      {!isFullScreen && (
        <>
          <Header />
          <NoticeBanner />
        </>
      )}
      {children}
    </AuthGuard>
  );
}
