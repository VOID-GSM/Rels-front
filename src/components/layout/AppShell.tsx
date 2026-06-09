"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "./Header";

const NoticeBanner = dynamic(() => import("./NoticeBanner"), { ssr: false });

const FULL_SCREEN_PATHS = ["/login", "/callback"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = FULL_SCREEN_PATHS.some((path) =>
    pathname?.startsWith(path),
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
