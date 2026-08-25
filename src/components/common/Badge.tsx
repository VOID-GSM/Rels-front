import { LECTURE_APPROVAL_NOTICE } from "@/constants/lecture";

export type BadgeVariant =
  "open" | "confirmed" | "closed" | "unconfirmed" | "pending" | "rejected";

interface BadgeProps {
  variant: BadgeVariant;
}

/**
 * 상태는 카드에서 가장 눈에 띄어야 할 정보가 아니라 가장 먼저 훑고 지나가는
 * 정보라, 채워진 알약 대신 점 하나와 라벨로만 구분합니다.
 */
const BADGE_CONFIG: Record<
  BadgeVariant,
  { label: string; dot: string; text: string }
> = {
  confirmed: {
    label: "개설 확정",
    dot: "bg-main",
    text: "text-gray-900",
  },
  open: {
    // 아직 확정 전이라는 뜻이 담기도록 속이 빈 점을 씁니다.
    label: "개설 미정",
    dot: "shadow-[inset_0_0_0_2px_var(--color-main)]",
    text: "text-gray-600",
  },
  unconfirmed: {
    label: "개설 불확정",
    dot: "shadow-[inset_0_0_0_2px_var(--color-gray-300)]",
    text: "text-gray-500",
  },
  closed: {
    label: "강연 종료",
    dot: "bg-gray-500",
    text: "text-gray-500",
  },
  // 학생회 승인 전. 개설자 본인에게만 보입니다.
  pending: {
    label: LECTURE_APPROVAL_NOTICE.PENDING,
    dot: "shadow-[inset_0_0_0_2px_var(--color-gray-400)]",
    text: "text-gray-500",
  },
  rejected: {
    label: LECTURE_APPROVAL_NOTICE.REJECTED,
    dot: "bg-error",
    text: "text-error",
  },
};

export default function Badge({ variant }: BadgeProps) {
  const { label, dot, text } = BADGE_CONFIG[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${text}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
