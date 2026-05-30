import LectureItem from "./LectureItem";
import type { MyPageLectureItem } from "./LectureItem";

export default function LectureList({
  title,
  lectures,
  emptyMessage,
  isLoading,
  onAction,
  actionLabel,
  disabled,
}: {
  title: string;
  lectures: MyPageLectureItem[];
  emptyMessage: string;
  isLoading: boolean;
  onAction: (id: number) => void;
  actionLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex-1 border border-main-200 rounded-2xl p-5 flex flex-col gap-3">
      <span className="font-semibold text-base">
        {title} ({lectures.length})
      </span>
      {isLoading ? (
        <p className="text-xs text-gray-400 py-4 text-center">불러오는 중...</p>
      ) : lectures.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lectures.map((lecture) => (
            <LectureItem
              key={lecture.lectureId}
              lecture={lecture}
              onAction={onAction}
              actionLabel={actionLabel}
              disabled={disabled}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
