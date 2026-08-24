"use client";

import Link from "next/link";
import { useState } from "react";
import Notification from "@/assets/svg/Notification";
import Cancel from "@/assets/svg/Cancel";
import { useGetNotices, MOCK_NOTICES } from "@/entities/notice";
import { useDesignPreview } from "@/shared/lib/useDesignPreview";

const DISMISSED_KEY = "dismissedNoticeId";

export default function NoticeBanner() {
  const { data } = useGetNotices();
  // 디자인 작업용 임시 처리: 비로그인 상태에서는 목 데이터로 채웁니다.
  const isPreview = useDesignPreview();
  const notices = isPreview ? MOCK_NOTICES : data;
  const latestNotice = notices?.content?.[0];

  // 닫은 공지 id를 기억해 뒀다가, 새 공지가 올라오면 다시 띄웁니다.
  // AppShell이 이 컴포넌트를 ssr: false로 불러오므로 첫 렌더부터 localStorage를
  // 읽어도 하이드레이션이 어긋나지 않습니다.
  const [dismissedId, setDismissedId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_KEY);
      return saved ? Number(saved) : null;
    } catch {
      // 저장소를 못 읽는 브라우저에서는 그냥 배너를 계속 보여줍니다.
      return null;
    }
  });

  if (!latestNotice || dismissedId === latestNotice.id) return null;

  const handleDismiss = () => {
    setDismissedId(latestNotice.id);
    try {
      localStorage.setItem(DISMISSED_KEY, String(latestNotice.id));
    } catch {
      // 저장에 실패해도 이번 세션에서는 닫힌 상태로 둡니다.
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 pt-6 md:px-10 xl:px-16">
      <div className="flex items-center gap-3 rounded-xl bg-surface py-2.5 pl-2.5 pr-2.5 shadow-e1">
        <Link
          href="/notification"
          className="focusable group flex min-w-0 flex-1 items-center gap-3 rounded-lg"
        >
          <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-main px-2.5 py-1.5 text-xs font-bold text-gray-900">
            <Notification />
            공지
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
            {latestNotice.title}
          </span>
          <span className="hidden shrink-0 text-xs text-gray-500 transition-colors group-hover:text-gray-900 sm:block">
            전체 보기
          </span>
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="공지 닫기"
          className="focusable flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <Cancel />
        </button>
      </div>
    </div>
  );
}
