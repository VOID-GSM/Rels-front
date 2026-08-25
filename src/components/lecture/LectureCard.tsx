import Link from "next/link";
import Badge from "@/components/common/Badge";
import type { BadgeVariant } from "@/components/common/Badge";
import type { LectureApprovalStatusType } from "@/entities/lecture";
import SeatMeter from "./SeatMeter";

interface LectureCardProps {
  title: string;
  speaker: string;
  status: BadgeVariant;
  currentCount: number;
  maxCount?: number;
  waitingCount?: number;
  /** 학생회 승인 전이면 카드를 회색으로 눕히고 상태를 바꿔 답니다. */
  approvalStatus?: LectureApprovalStatusType;
}

function LectureCardContent({
  title,
  speaker,
  status,
  currentCount,
  maxCount,
  waitingCount,
  approvalStatus,
}: LectureCardProps) {
  // 아직 학생들에게 안 나간 강연은 강연 상태(개설 미정 등)를 말해봐야 의미가
  // 없어서, 배지 자리를 승인 상태로 바꿔 답니다.
  const isNotPublished =
    approvalStatus === "PENDING" || approvalStatus === "REJECTED";
  const badgeVariant: BadgeVariant = isNotPublished
    ? approvalStatus === "PENDING"
      ? "pending"
      : "rejected"
    : status;

  return (
    <>
      <div className="flex flex-1 flex-col justify-between gap-3 p-5">
        <div className="flex flex-col gap-2">
          <Badge variant={badgeVariant} />
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
        muted={
          isNotPublished || status === "closed" || status === "unconfirmed"
        }
      />
    </>
  );
}

const CARD_SURFACE =
  "flex h-full w-full flex-col overflow-hidden rounded-2xl transition-[box-shadow,transform] duration-200";

export default function LectureCard({
  id,
  ...content
}: LectureCardProps & { id: string }) {
  // 아직 안 올라간 강연은 흰 카드에서 내려 회색 면에 눕힙니다. 옆 카드들과
  // 같은 높이로 떠 있으면 이미 공개된 것처럼 보입니다.
  const isNotPublished =
    content.approvalStatus === "PENDING" ||
    content.approvalStatus === "REJECTED";

  return (
    <Link
      href={`/lectures/${id}`}
      className={`focusable lift ${CARD_SURFACE} ${
        isNotPublished
          ? "bg-gray-100 shadow-none hover:shadow-e1"
          : "bg-surface shadow-e2 hover:-translate-y-0.5 hover:shadow-e3"
      }`}
    >
      <LectureCardContent {...content} />
    </Link>
  );
}
