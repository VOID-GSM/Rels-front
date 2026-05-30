"use client";

import Link from "next/link";
import Notification from "@/assets/svg/Notification";
import { useGetNotices } from "@/entities/notice";

export default function NoticeBanner() {
  const { data } = useGetNotices();
  const latestNotice = data?.content?.[0];

  if (!latestNotice) return null;

  return (
    <Link href="/notification">
      <div className="w-full bg-main-100 border-b border-main-200 py-2.5 hover:bg-main-200 transition-colors cursor-pointer">
        <div className="max-w-[800px] mx-auto px-6 flex items-center gap-2 text-sm text-gray-700">
          <Notification />
          <span className="font-medium text-main">공지</span>
          <span className="mx-1 text-gray-300">|</span>
          <span className="min-w-0 flex-1 truncate">{latestNotice.title}</span>
        </div>
      </div>
    </Link>
  );
}
