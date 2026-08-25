"use client";

import { useState } from "react";
import Image from "next/image";
import { usePWAStore } from "@/stores/pwaStore";
import {
  useIsStandalone,
  usePlatform,
  type PlatformId,
} from "@/shared/lib/pwaDisplayMode";
import Download from "@/assets/svg/Download";
import Notification from "@/assets/svg/Notification";
import Phone from "@/assets/svg/Phone";
import Bolt from "@/assets/svg/Bolt";
import PageShell from "@/components/layout/PageShell";

const BENEFITS: {
  icon: () => React.ReactElement;
  title: string;
  description: string;
}[] = [
  {
    icon: Notification,
    title: "실시간 알림",
    description:
      "강연 신청 결과, 대기 순번 변경, 공지사항을 앱 알림으로 바로 받습니다.",
  },
  {
    icon: Phone,
    title: "앱처럼 사용",
    description:
      "홈 화면 아이콘을 누르면 주소창 없이 열리고, 브라우저 UI 없이 화면 전체를 씁니다.",
  },
  {
    icon: Bolt,
    title: "빠른 로딩",
    description:
      "자주 쓰는 파일이 기기에 남아 다음 실행이 눈에 띄게 빨라집니다.",
  },
];

const PLATFORMS: {
  id: PlatformId;
  label: string;
  browser: string;
  steps: string[];
  note?: string;
}[] = [
  {
    id: "ios",
    label: "iPhone · iPad",
    browser: "Safari",
    steps: [
      "화면 아래쪽 공유 버튼을 누르세요.",
      '메뉴를 내려 "홈 화면에 추가"를 누르세요.',
      '오른쪽 위 "추가"를 누르면 홈 화면에 Rels 아이콘이 생깁니다.',
    ],
    note: "iOS는 Safari에서만 설치할 수 있습니다. 다른 브라우저로 열었다면 Safari로 다시 열어 주세요.",
  },
  {
    id: "android",
    label: "Android",
    browser: "Chrome",
    steps: [
      "오른쪽 위 메뉴 버튼을 누르세요.",
      '"앱 설치" 또는 "홈 화면에 추가"를 누르세요.',
      "홈 화면에 Rels 아이콘이 생깁니다.",
    ],
    note: '삼성 인터넷을 쓴다면 메뉴에서 "현재 페이지 추가" → "홈 화면"을 고르세요.',
  },
  {
    id: "windows",
    label: "노트북 · PC",
    browser: "Chrome / Edge",
    steps: [
      "주소창 오른쪽 끝의 설치 아이콘을 클릭하세요.",
      '"Rels 설치" 팝업에서 "설치"를 클릭하세요.',
      "바탕화면이나 시작 메뉴에서 Rels를 실행할 수 있습니다.",
    ],
  },
  {
    id: "mac",
    label: "Mac",
    browser: "Safari",
    steps: [
      '상단 메뉴에서 "파일" → "Dock에 추가"를 클릭하세요.',
      '"추가"를 클릭하면 Dock에 Rels가 들어갑니다.',
    ],
  },
];

/**
 * 설치하고 나면 홈 화면이 어떻게 되는지 보여 주는 장식용 목업입니다.
 * 읽을 내용은 없으므로 스크린리더에서는 통째로 건너뜁니다.
 */
function HomeScreenPreview() {
  return (
    <div aria-hidden className="relative shrink-0">
      {/* 기기 뒤에 깔리는 브랜드 색 판. 흰 카드만 늘어놓지 않으려고 둡니다. */}
      <div className="absolute -inset-x-6 -inset-y-4 rounded-[44px] bg-main-soft" />

      <div className="relative w-[220px] rounded-[38px] bg-gray-900 p-2.5 shadow-e4">
        <div className="flex flex-col rounded-[30px] bg-canvas px-3.5 pb-6 pt-3">
          <span className="mx-auto h-1 w-14 rounded-full bg-gray-300" />

          {/* 알림이 설치하는 가장 큰 이유라 화면 위에 먼저 띄웁니다. */}
          <div className="mt-4 rounded-2xl bg-surface p-3 shadow-e2">
            <div className="flex items-center gap-1.5">
              <Image
                src="/img/Rels_logo_192x192.png"
                alt=""
                width={14}
                height={14}
                className="rounded-[4px]"
              />
              <span className="text-[10px] font-semibold text-gray-500">
                Rels
              </span>
            </div>
            <p className="mt-1 text-[11px] font-bold leading-snug text-gray-900">
              신청한 강연이 확정되었습니다
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-4">
            <div className="flex flex-col items-center gap-1.5">
              <Image
                src="/img/Rels_logo_192x192.png"
                alt=""
                width={44}
                height={44}
                className="rounded-xl shadow-e1"
              />
              <span className="text-[9px] font-semibold text-gray-700">
                Rels
              </span>
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="h-11 w-11 rounded-xl bg-gray-200" />
                <div className="h-1 w-6 rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PWAInstallPage() {
  const { isInstallable, install } = usePWAStore();

  // 지금 보고 있는 기기에 맞는 탭을 먼저 펴 둡니다.
  const detected = usePlatform();
  const isStandalone = useIsStandalone();

  // 탭을 직접 고르기 전까지는 감지한 기기를 씁니다.
  const [selected, setSelected] = useState<PlatformId | null>(null);

  const activePlatform = selected ?? detected;
  const guide = PLATFORMS.find((p) => p.id === activePlatform) ?? PLATFORMS[0];

  return (
    <PageShell size="narrow" className="flex flex-col gap-16">
      <header className="flex flex-col-reverse items-center gap-12 md:flex-row md:justify-between md:gap-10">
        <div className="flex w-full min-w-0 flex-col items-start gap-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-main-soft py-1.5 pl-1.5 pr-3.5">
            <Image
              src="/img/Rels_logo_192x192.png"
              alt=""
              width={22}
              height={22}
              className="rounded-md"
            />
            <span className="text-xs font-bold text-gray-900">Rels 앱</span>
          </span>

          <h1 className="text-[38px] font-bold leading-[1.15] tracking-[-0.03em] text-gray-900 md:text-[48px]">
            홈 화면에서
            <br />
            바로 여세요
          </h1>

          <p className="max-w-[44ch] text-[15px] leading-relaxed text-gray-600">
            브라우저를 거치지 않고 앱처럼 열리고, 신청 결과와 공지를 알림으로
            받아볼 수 있습니다. 설치해도 저장 공간은 거의 쓰지 않습니다.
          </p>

          {isStandalone ? (
            <p className="rounded-xl bg-success-soft px-4 py-3 text-sm font-semibold text-success">
              이미 앱으로 실행 중입니다
            </p>
          ) : (
            <div className="flex flex-col items-start gap-3">
              {/* 이 화면에서 가장 진한 그림자는 설치 버튼 하나입니다. */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={install}
                  className="focusable flex items-center gap-2 rounded-xl bg-main px-6 py-3.5 font-semibold text-gray-900 shadow-e2 transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-e3"
                >
                  <Download />앱 설치하기
                </button>
              )}
              <p className="text-xs leading-relaxed text-gray-500">
                {isInstallable
                  ? "설치 창이 뜨지 않는다면 "
                  : "이 브라우저는 자동 설치를 지원하지 않습니다. "}
                <a
                  href="#install-guide"
                  className="focusable rounded font-semibold text-gray-700 underline underline-offset-4 transition-colors hover:text-gray-900"
                >
                  기기별 설치 방법
                </a>
                을 따라 하세요.
              </p>
            </div>
          )}
        </div>

        <HomeScreenPreview />
      </header>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
          설치하면 달라지는 것
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-2xl bg-surface p-5 shadow-e1"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-main-soft text-gray-900">
                <Icon />
              </span>
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="text-sm leading-relaxed text-gray-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="install-guide" className="flex scroll-mt-24 flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
            기기별 설치 방법
          </h2>
          <p className="text-sm text-gray-500">
            지금 쓰는 기기에 맞는 순서를 먼저 펴 두었습니다.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="기기 선택"
          className="flex flex-wrap gap-1 rounded-2xl bg-gray-100 p-1.5"
        >
          {PLATFORMS.map(({ id, label }) => {
            const isActive = id === activePlatform;

            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={isActive}
                aria-controls="install-steps"
                onClick={() => setSelected(id)}
                className={`focusable flex-1 cursor-pointer whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-surface text-gray-900 shadow-e1"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="install-steps"
          aria-labelledby={`tab-${activePlatform}`}
          className="flex flex-col gap-5 rounded-2xl bg-surface p-6 shadow-e2 md:p-7"
        >
          <p className="text-xs font-semibold text-gray-500">
            {guide.label} · {guide.browser}
          </p>

          <ol className="flex flex-col">
            {guide.steps.map((step, index) => (
              <li key={step} className="relative flex gap-4 pb-5 last:pb-0">
                {/* 번호끼리 선으로 이어 두면 순서대로 읽힙니다. */}
                {index < guide.steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[13px] top-8 h-[calc(100%-2rem)] w-px bg-gray-200"
                  />
                )}
                <span className="tnum relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-main-soft text-xs font-bold text-gray-900">
                  {index + 1}
                </span>
                <p className="pt-1 text-[15px] leading-relaxed text-gray-700">
                  {step}
                </p>
              </li>
            ))}
          </ol>

          {guide.note && (
            <p className="rounded-xl bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-600">
              {guide.note}
            </p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
