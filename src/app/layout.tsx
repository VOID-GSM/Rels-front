import "./globals.css";
import type { Metadata } from "next";
import QueryProvider from "@/providers/QueryProvider";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
  title: "Rels",
  description:
    "광주소프트웨어마이스터고 학생 주도 강연 개설 및 신청 기반 릴레이 스터디 관리 서비스 Rels",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
