"use client";

import Image from "next/image";
import { usePWAStore } from "@/stores/pwaStore";
import Download from "@/assets/svg/Download";
import PageShell from "@/components/layout/PageShell";

const BENEFITS: { icon: string; title: string; description: string }[] = [
  {
    icon: "🔔",
    title: "실시간 알림",
    description:
      "강연 신청 결과, 대기 순번 변경, 공지사항 등 중요한 소식을 앱 알림으로 바로 받아볼 수 있어요.",
  },
  {
    icon: "🚀",
    title: "빠른 접속",
    description:
      "홈 화면 아이콘을 탭하면 브라우저 주소창 없이 바로 Rels가 열려요.",
  },
  {
    icon: "📱",
    title: "앱처럼 사용",
    description:
      "풀스크린으로 더 넓은 화면을 활용할 수 있고, 네이티브 앱과 같은 느낌으로 사용할 수 있어요.",
  },
  {
    icon: "⚡",
    title: "빠른 로딩",
    description:
      "자주 사용하는 리소스가 캐시되어 더 빠르게 로딩돼요.",
  },
];

const DESKTOP_STEPS: { browser: string; steps: string[] }[] = [
  {
    browser: "Chrome / Edge",
    steps: [
      "주소창 오른쪽 끝의 설치 아이콘(⊕ 또는 컴퓨터 아이콘)을 클릭하세요.",
      '"Rels 설치" 팝업이 나타나면 "설치" 버튼을 클릭하세요.',
      "설치가 완료되면 바탕화면 또는 시작 메뉴에서 Rels 앱을 실행할 수 있습니다.",
    ],
  },
  {
    browser: "Safari (macOS)",
    steps: [
      '상단 메뉴에서 "파일" → "Dock에 추가"를 클릭하세요.',
      '"추가" 버튼을 클릭하면 Dock에 Rels 앱이 추가됩니다.',
    ],
  },
];

const MOBILE_STEPS: { os: string; steps: string[] }[] = [
  {
    os: "Android (Chrome)",
    steps: [
      "브라우저 오른쪽 상단 메뉴(⋮)를 탭하세요.",
      '"앱 설치" 또는 "홈 화면에 추가"를 탭하세요.',
      "홈 화면에 Rels 아이콘이 추가됩니다.",
    ],
  },
  {
    os: "iOS (Safari)",
    steps: [
      "하단 공유 버튼을 탭하세요.",
      '"홈 화면에 추가"를 탭하세요.',
      '오른쪽 상단 "추가"를 탭하면 홈 화면에 Rels 아이콘이 추가됩니다.',
    ],
  },
];

function StepCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface p-5 shadow-e2">
      <p className="text-sm font-bold text-gray-900">{title}</p>
      <ol className="flex flex-col gap-2.5">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-gray-600">
            <span className="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-main text-xs font-bold text-gray-900">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function PWAInstallPage() {
  const { isInstallable, install } = usePWAStore();

  return (
    <PageShell className="flex flex-col gap-16">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <Image
          src="/img/Rels_logo_192x192.png"
          alt="Rels"
          width={72}
          height={72}
          className="rounded-2xl"
        />
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Rels 앱 설치
          </h1>
          <p className="max-w-[52ch] text-sm leading-relaxed text-gray-600">
            홈 화면에 추가하면 브라우저 없이 바로 열리고, 신청 결과와 공지를
            알림으로 받아볼 수 있습니다.
          </p>
        </div>
        {isInstallable && (
          <button
            type="button"
            onClick={install}
            className="focusable ml-auto flex shrink-0 items-center gap-2 rounded-xl bg-main px-6 py-3 font-semibold text-gray-900 shadow-e2 transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-e3"
          >
            <Download />
            앱 설치하기
          </button>
        )}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-gray-900">설치하면 달라지는 것</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BENEFITS.map(({ icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl bg-surface p-5 shadow-e2"
            >
              <span className="text-2xl leading-none">{icon}</span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-sm leading-relaxed text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-gray-900">노트북 · PC에서 설치</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {DESKTOP_STEPS.map(({ browser, steps }) => (
            <StepCard key={browser} title={browser} steps={steps} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-gray-900">모바일에서 설치</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {MOBILE_STEPS.map(({ os, steps }) => (
            <StepCard key={os} title={os} steps={steps} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
