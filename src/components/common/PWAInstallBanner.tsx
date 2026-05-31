"use client";

import Image from "next/image";
import { usePWAStore } from "@/stores/pwaStore";

export default function PWAInstallBanner() {
  const { isInstallable, bannerDismissed, install, dismissBanner } =
    usePWAStore();

  if (!isInstallable || bannerDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 border-t border-main-200 bg-white px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <Image
          src="/img/Rels_logo_192x192.png"
          alt="Rels"
          width={36}
          height={36}
          className="rounded-lg"
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">Rels 앱 설치</p>
          <p className="text-xs text-gray-500">
            홈 화면에 추가하고 더 빠르게 사용하세요
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={dismissBanner}
          className="px-2 py-1 text-xs text-gray-400"
        >
          나중에
        </button>
        <button
          onClick={install}
          className="rounded-lg bg-main px-3 py-1.5 text-xs font-semibold text-white"
        >
          앱으로 설치하기
        </button>
      </div>
    </div>
  );
}
