"use client";

export interface LectureSwitcherProps {
  items: { id: number; title: string }[];
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
  // 고를 것이 없는데 칩 줄만 떠 있으면 강연이 더 있는 것처럼 읽힙니다.
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

      <div className="flex flex-wrap gap-2">
        {items.map(({ id, title }) => {
          const isSelected = id === selectedId;

          return (
            <button
              key={id}
              type="button"
              aria-pressed={isSelected}
              // 말줄임으로 잘린 제목은 마우스를 올려야만 끝까지 볼 수 있습니다.
              title={title}
              onClick={() => onSelect(id)}
              // 칩은 캔버스 위에 바로 놓이므로 테두리 대신 그림자로 띄웁니다.
              // 제목이 길면 한 칩이 줄을 통째로 먹어 나머지가 접히기 때문에
              // 폭을 잘라 두고 넘치는 부분만 말줄임합니다.
              className={`focusable max-w-[220px] cursor-pointer truncate rounded-xl px-3.5 py-2 text-sm font-semibold transition-[background-color,box-shadow,color] ${
                isSelected
                  ? "bg-main text-gray-900 shadow-e2"
                  : "bg-surface text-gray-600 shadow-e1 hover:text-gray-900 hover:shadow-e2"
              }`}
            >
              {title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
