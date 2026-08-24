"use client";

import Link from "next/link";
import Notification from "@/assets/svg/Notification";
import { useGetNotices, MOCK_NOTICES } from "@/entities/notice";
import { useDesignPreview } from "@/shared/lib/useDesignPreview";

export default function NoticeBanner() {
  const { data } = useGetNotices();
  // 디자인 작업용 임시 처리: 비로그인 상태에서는 목 데이터로 채웁니다.
  const isPreview = useDesignPreview();
  const notices = isPreview ? MOCK_NOTICES : data;
  const latestNotice = notices?.content?.[0];

  if (!latestNotice) return null;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 pt-6 md:px-10 xl:px-16">
      <Link
        href="/notification"
        className="focusable group flex items-center gap-3 rounded-xl bg-surface py-2.5 pl-2.5 pr-4 shadow-e1 transition-shadow hover:shadow-e2"
      >
        <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-main px-2.5 py-1.5 text-xs font-bold text-gray-900">
          <Notification />
          공지
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
          {latestNotice.title}
        </span>
        <span className="shrink-0 text-xs text-gray-500 transition-colors group-hover:text-gray-900">
          전체 보기
        </span>
      </Link>
    </div>
  );
}
