"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/common/Header";
import NoticeBanner from "@/components/common/NoticeBanner";

const FULL_SCREEN_PATHS = ["/login", "/callback"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = FULL_SCREEN_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  return (
    <>
      {!isFullScreen && (
        <>
          <Header />
          <NoticeBanner />
        </>
      )}
      {children}
    </>
  );
}
