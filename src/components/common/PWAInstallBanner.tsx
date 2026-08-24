"use client";

import Image from "next/image";
import { usePWAStore } from "@/stores/pwaStore";

export default function PWAInstallBanner() {
  const { isInstallable, bannerDismissed, install, dismissBanner } =
    usePWAStore();

  if (!isInstallable || bannerDismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3">
      <div className="mx-auto flex max-w-[560px] items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 shadow-e4">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src="/img/Rels_logo_192x192.png"
            alt=""
            width={36}
            height={36}
            className="shrink-0 rounded-lg"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">Rels 앱 설치</p>
            <p className="truncate text-xs text-gray-600">
              홈 화면에 추가하면 알림까지 받아볼 수 있습니다
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={dismissBanner}
            className="focusable rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            나중에
          </button>
          <button
            type="button"
            onClick={install}
            className="focusable rounded-lg bg-main px-3.5 py-2 text-xs font-bold text-gray-900 shadow-e2 transition-shadow hover:shadow-e3"
          >
            설치
          </button>
        </div>
      </div>
    </div>
  );
}
