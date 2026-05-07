import Badge from "@/components/common/Badge";
import People from "@/assets/svg/People";
import Link from "next/link";

interface LectureCardProps {
  id: string;
  title: string;
  speaker: string;
  status: "open" | "confirmed" | "failed" | "closed" | "unconfirmed";
  currentCount: number;
  maxCount?: number;
  waitingCount?: number;
  onClick?: () => void;
}

export default function LectureCard({
  id,
  title,
  speaker,
  status,
  currentCount,
  maxCount,
  waitingCount,
  onClick,
}: LectureCardProps) {
  const inner = (
    <div className="max-w-[300px] w-full flex flex-col justify-between border border-main-200 rounded-2xl p-5 gap-3 cursor-pointer hover:shadow-md transition-shadow h-[200px]">
      {/* 상단 */}
      <div className="flex flex-col gap-2">
        <Badge variant={status} />
        <p className="font-bold text-lg text-gray-900 line-clamp-1">{title}</p>
        <p className="text-sm text-gray-500">{speaker}</p>
      </div>

      {/* 하단 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <People />
          <span>
            {maxCount ? `${currentCount}/${maxCount}명` : `${currentCount}명`}
          </span>
          {waitingCount && waitingCount > 0 ? (
            <span className="ml-1">(대기 {waitingCount}명)</span>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return <div onClick={onClick}>{inner}</div>;
  }

  return <Link href={`/lectures/${id}`}>{inner}</Link>;
}
