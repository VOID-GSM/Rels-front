type BadgeVariant = "open" | "confirmed" | "closed" | "unconfirmed";

interface BadgeProps {
  variant: BadgeVariant;
}

const BADGE_CONFIG: Record<BadgeVariant, { label: string; style: string }> = {
  open: {
    label: "개설 미정",
    style: "bg-main-100 text-gray-600",
  },
  confirmed: {
    label: "개설 확정",
    style: "bg-main text-black",
  },
  unconfirmed: {
    label: "개설 불확정",
    style: "bg-gray-200 text-gray-600",
  },
  closed: {
    label: "강연 종료",
    style: "bg-gray-700 text-white",
  },
};

export default function Badge({ variant }: BadgeProps) {
  const { label, style } = BADGE_CONFIG[variant];

  return (
    <span
      className={`inline-block w-[88px] text-center py-1 rounded-md text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
