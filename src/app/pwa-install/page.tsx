"use client";

import Image from "next/image";
import { usePWAStore } from "@/stores/pwaStore";
import Download from "@/assets/svg/Download";

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
      "하단 공유 버튼(□↑)을 탭하세요.",
      '"홈 화면에 추가"를 탭하세요.',
      '오른쪽 상단 "추가"를 탭하면 홈 화면에 Rels 아이콘이 추가됩니다.',
    ],
  },
];

function StepCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-main-200 bg-white p-5">
      <p className="font-semibold text-gray-800">{title}</p>
      <ol className="flex flex-col gap-2.5">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-gray-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-main text-xs font-bold text-white">
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
    <main className="mx-auto flex max-w-[800px] flex-col gap-10 px-6 py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/img/Rels_logo_192x192.png"
          alt="Rels"
          width={72}
          height={72}
          className="rounded-2xl"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rels 앱 설치</h1>
          <p className="mt-1 text-sm text-gray-500">
            홈 화면에 추가하고 더 빠르게 사용하세요
          </p>
        </div>
        {isInstallable && (
          <button
            type="button"
            onClick={install}
            className="flex items-center gap-2 rounded-xl bg-main px-6 py-3 font-semibold text-white shadow-sm transition-opacity hover:opacity-80"
          >
            <Download />
            앱 설치하기
          </button>
        )}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">앱을 설치하면 뭐가 좋나요?</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BENEFITS.map(({ icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border border-main-200 bg-white p-5"
            >
              <span className="text-2xl leading-none">{icon}</span>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="text-sm leading-relaxed text-gray-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">💻 노트북 / PC에서 설치</h2>
        <div className="flex flex-col gap-4">
          {DESKTOP_STEPS.map(({ browser, steps }) => (
            <StepCard key={browser} title={browser} steps={steps} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">📱 모바일에서 설치</h2>
        <div className="flex flex-col gap-4">
          {MOBILE_STEPS.map(({ os, steps }) => (
            <StepCard key={os} title={os} steps={steps} />
          ))}
        </div>
      </section>
    </main>
  );
}
