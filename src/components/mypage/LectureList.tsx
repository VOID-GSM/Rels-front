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
    <section className="flex flex-1 flex-col gap-3.5 rounded-2xl bg-surface p-5 shadow-e2">
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        <span className="tnum text-sm text-gray-500">{lectures.length}</span>
      </div>
      {isLoading ? (
        <p className="py-6 text-center text-xs text-gray-500">불러오는 중</p>
      ) : lectures.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-500">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
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
    </section>
  );
}
