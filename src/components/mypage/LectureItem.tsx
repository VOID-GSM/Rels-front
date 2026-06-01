import Link from "next/link";
import type { MyCreatedLecture, MyEnrolledLecture } from "@/entities/lecture";
import { LECTURE_STATUS_LABEL } from "@/constants/lecture";

export type MyPageLectureItem = (MyCreatedLecture | MyEnrolledLecture) & { meta?: string };

export default function LectureItem({
  lecture,
  onAction,
  actionLabel,
  disabled,
}: {
  lecture: MyPageLectureItem;
  onAction: (id: number) => void;
  actionLabel: string;
  disabled?: boolean;
}) {
  const statusLabel = LECTURE_STATUS_LABEL[lecture.lectureStatus] ?? lecture.lectureStatus;

  return (
    <li className="flex items-center justify-between bg-background rounded-xl px-4 py-3 gap-3">
      <Link
        href={`/lectures/${lecture.lectureId}`}
        className="flex flex-col gap-1.5 flex-1 min-w-0"
      >
        <span className="text-sm font-medium text-gray-800 line-clamp-1">
          {lecture.title}
        </span>
        <div className="flex items-center gap-2 min-w-0">
          {lecture.meta && (
            <>
              <span className="text-xs text-gray-500 line-clamp-1">{lecture.meta}</span>
              <span className="text-gray-500">|</span>
            </>
          )}
          <span className="text-xs text-gray-500 shrink-0">{statusLabel}</span>
        </div>
      </Link>
      <button
        onClick={() => onAction(lecture.lectureId)}
        disabled={disabled}
        className="shrink-0 text-xs text-error hover:underline disabled:text-gray-300 disabled:hover:no-underline"
      >
        {actionLabel}
      </button>
    </li>
  );
}
