import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import QueryProvider from "@/shared/lib/QueryProvider";
import AppShell from "@/components/layout/AppShell";
import LazyPWAProvider from "@/components/layout/LazyPWAProvider";
import { Toaster } from "sonner";
import { GA_MEASUREMENT_ID } from "@/constants/analytics";

// 개발 환경 트래픽이 GA 리포트를 오염시키지 않도록 프로덕션에서만 태그를 심습니다.
// 서버 컴포넌트에서 판정하므로 dev 빌드에는 스크립트가 아예 나가지 않습니다.
const isProduction = process.env.NODE_ENV === "production";

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
    apple: "/img/apple-touch-icon.png",
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
        {/*
          GA 공식 스니펫은 <head> 삽입을 안내하지만 App Router 레이아웃에는
          직접 쓰는 <head> 엘리먼트가 없습니다. Next.js가 문서에서 권하는
          GA 설치 방식이 next/script의 afterInteractive이고 동작상 동등하므로
          그대로 따릅니다. next/script는 서버 컴포넌트에서도 정상 동작해
          "use client"가 필요 없습니다.
        */}
        {isProduction && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
                `.trim(),
              }}
            />
          </>
        )}
        <QueryProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-center" richColors />
          <LazyPWAProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
