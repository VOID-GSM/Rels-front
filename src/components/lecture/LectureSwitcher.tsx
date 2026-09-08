"use client";

import Badge from "@/components/common/Badge";
import type { BadgeVariant } from "@/components/common/Badge";

export interface LectureSwitcherItem {
  id: number;
  title: string;
  status: BadgeVariant;
  /** "김OO · 9월 12일" 처럼 페이지에서 이미 조립해 넘기는 한 줄. 없을 수 있다. */
  meta?: string;
}

export interface LectureSwitcherProps {
  items: LectureSwitcherItem[];
  selectedId: number;
  onSelect: (id: number) => void;
  className?: string;
}

export default function LectureSwitcher({
  items,
  selectedId,
  onSelect,
  className = "",
}: LectureSwitcherProps) {
  // 고를 것이 없는데 전환 줄만 떠 있으면 강연이 더 있는 것처럼 읽힙니다.
  // 열린 강연이 하나뿐인 첫 화면은 지금 모습 그대로 두어야 합니다.
  if (items.length <= 1) return null;

  return (
    <div
      role="group"
      aria-label="열린 강연 선택"
      className={`flex flex-col gap-2.5 ${className}`}
    >
      <span className="tnum text-xs font-medium text-gray-500">
        열린 강연 {items.length}개
      </span>

      {/* 폭을 고정하면 화면이 넓을 때 카드가 왼쪽에 짧게 몰려 붙고, 남는 폭을
          전부 나눠 가지면 두 개일 때 한 장이 화면 절반까지 늘어납니다.
          최소·최대 폭을 함께 잡아 그 사이에서만 늘어나게 둡니다. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,20rem))] gap-2.5">
        {items.map(({ id, title, status, meta }) => {
          const isSelected = id === selectedId;

          return (
            <button
              key={id}
              type="button"
              aria-pressed={isSelected}
              // 두 줄까지 흘리고 남는 제목은 마우스를 올려야만 끝까지 볼 수 있습니다.
              title={title}
              onClick={() => onSelect(id)}
              // 제목만 든 알약은 "그냥 버튼"으로 읽혀서, 목록의 LectureCard와
              // 같은 순서(배지 → 제목 → 한 줄 정보)를 크기만 줄여 그대로 씁니다.
              // 폭은 그리드가 정합니다.
              className={`focusable flex w-full cursor-pointer flex-col gap-1.5 rounded-2xl px-5 py-4 text-left transition-[background-color,box-shadow] ${
                isSelected
                  ? // bg-main으로 꽉 채우면 배지의 amber 점이 배경에 묻혀 상태가
                    // 사라집니다. 점이 살아남는 옅은 면으로 채워 띄웁니다.
                    "bg-main-soft shadow-e2"
                  : "bg-surface shadow-e1 hover:shadow-e2"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <Badge variant={status} />
                {/* 고른 카드가 지금 아래 스포트라이트에 서 있다는 연결을 만들어 줍니다. */}
                {isSelected ? (
                  <span className="shrink-0 text-[11px] font-semibold text-gray-500">
                    보는 중
                  </span>
                ) : null}
              </span>

              <span className="line-clamp-2 break-words text-sm font-bold leading-snug text-gray-900">
                {title}
              </span>

              {/* meta가 없을 때 빈 줄이 남으면 카드 높이만 들쭉날쭉해집니다. */}
              {meta ? (
                <span className="tnum truncate text-xs text-gray-500">
                  {meta}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
