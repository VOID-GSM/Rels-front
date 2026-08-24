import Link from "next/link";
import Badge from "@/components/common/Badge";
import type { BadgeVariant } from "@/components/common/Badge";
import SeatMeter from "./SeatMeter";

export interface LectureCardProps {
  title: string;
  speaker: string;
  status: BadgeVariant;
  currentCount: number;
  maxCount?: number;
  waitingCount?: number;
}

/** 링크 없이 카드 겉모습만 그립니다. 개설 폼의 미리보기가 이걸 그대로 씁니다. */
export function LectureCardContent({
  title,
  speaker,
  status,
  currentCount,
  maxCount,
  waitingCount,
}: LectureCardProps) {
  return (
    <>
      <div className="flex flex-1 flex-col justify-between gap-3 p-5">
        <div className="flex flex-col gap-2">
          <Badge variant={status} />
          <p className="line-clamp-2 break-words text-[17px] font-bold leading-snug text-gray-900">
            {title}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="truncate text-sm text-gray-600">{speaker}</p>
          <div className="tnum flex items-baseline gap-1.5 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{currentCount}</span>
            {maxCount ? (
              <span className="text-gray-500">/ {maxCount}명</span>
            ) : (
              <span className="text-gray-500">명 신청</span>
            )}
            {waitingCount && waitingCount > 0 ? (
              <span className="text-xs text-gray-500">대기 {waitingCount}</span>
            ) : null}
          </div>
        </div>
      </div>

      <SeatMeter
        enrolled={currentCount}
        capacity={maxCount ?? 0}
        muted={status === "closed" || status === "unconfirmed"}
      />
    </>
  );
}

export const LECTURE_CARD_SURFACE =
  "flex h-full w-full flex-col overflow-hidden rounded-2xl bg-surface shadow-e2";

export default function LectureCard({
  id,
  ...content
}: LectureCardProps & { id: string }) {
  return (
    <Link
      href={`/lectures/${id}`}
      className={`focusable lift ${LECTURE_CARD_SURFACE} transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-e3`}
    >
      <LectureCardContent {...content} />
    </Link>
  );
}
