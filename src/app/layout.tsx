import "./globals.css";
import type { Metadata, Viewport } from "next";
import QueryProvider from "@/shared/lib/QueryProvider";
import AppShell from "@/components/layout/AppShell";
import LazyPWAProvider from "@/components/layout/LazyPWAProvider";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  themeColor: "#ffb235",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Rels - 릴레이스터디",
  description:
    "광주소프트웨어마이스터고 학생 주도 강연 개설 및 신청 기반 릴레이 스터디 관리 서비스 Rels",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rels",
  },
  icons: {
    apple: "/img/Rels.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-center" richColors />
          <LazyPWAProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
