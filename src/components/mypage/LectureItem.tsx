import Link from "next/link";
import type { MyCreatedLecture, MyEnrolledLecture } from "@/entities/lecture";
import { LECTURE_STATUS_LABEL } from "@/constants/lecture";

export type MyPageLectureItem = (MyCreatedLecture | MyEnrolledLecture) & {
  meta?: string;
};

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
  const statusLabel =
    LECTURE_STATUS_LABEL[lecture.lectureStatus] ?? lecture.lectureStatus;

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100">
      <Link
        href={`/lectures/${lecture.lectureId}`}
        className="focusable flex min-w-0 flex-1 flex-col gap-1 rounded-lg"
      >
        <span className="line-clamp-1 text-sm font-semibold text-gray-900">
          {lecture.title}
        </span>
        <span className="line-clamp-1 text-xs text-gray-600">
          {lecture.meta ? `${lecture.meta} · ${statusLabel}` : statusLabel}
        </span>
      </Link>
      <button
        type="button"
        onClick={() => onAction(lecture.lectureId)}
        disabled={disabled}
        className="focusable shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-error transition-colors hover:bg-error-soft disabled:text-gray-300 disabled:hover:bg-transparent"
      >
        {actionLabel}
      </button>
    </li>
  );
}
