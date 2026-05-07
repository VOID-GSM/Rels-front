"use client";

import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { useGetLectures } from "@/entities/lecture";
import type { LectureType, LectureStatusType } from "@/entities/lecture";
import LectureCard from "@/components/common/LectureCard";
import CreateLectureButton from "@/components/common/CreateLectureButton";
import { authUrls } from "@/shared/api/apiUrls";

const STATUS_TO_BADGE: Record<
  LectureStatusType,
  "open" | "confirmed" | "failed" | "closed" | "unconfirmed"
> = {
  OPEN: "open",
  CONFIRMED: "confirmed",
  FAILED: "failed",
  CLOSED: "closed",
  UNCONFIRMED: "unconfirmed",
};

// 강연 종료, 개설 불확정을 뒤로 정렬
const STATUS_SORT_ORDER: Record<LectureStatusType, number> = {
  CONFIRMED: 0,
  OPEN: 1,
  FAILED: 2,
  UNCONFIRMED: 2,
  CLOSED: 3,
};

const sortLectures = (lectures: LectureType[]) =>
  [...lectures].sort(
    (a, b) =>
      STATUS_SORT_ORDER[a.lectureStatus] - STATUS_SORT_ORDER[b.lectureStatus],
  );

function LectureGrid({ lectures, onCardClick }: { lectures: LectureType[]; onCardClick?: (id: string) => void }) {
  if (lectures.length === 0) {
    return (
      <p className="text-sm text-gray-400">등록된 강연이 없습니다.</p>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,300px))] gap-4">
      {sortLectures(lectures).map((lecture) => (
        <LectureCard
          key={lecture.lectureId}
          id={String(lecture.lectureId)}
          title={lecture.title}
          speaker={lecture.creatorName}
          status={STATUS_TO_BADGE[lecture.lectureStatus]}
          currentCount={lecture.enrolledCount}
          maxCount={lecture.totalCapacity ?? ((lecture.capacityByGrade?.["1"] ?? 0) + (lecture.capacityByGrade?.["2"] ?? 0) + (lecture.capacityByGrade?.["3"] ?? 0))}
          waitingCount={lecture.waitingCount}
          onClick={onCardClick ? () => onCardClick(String(lecture.lectureId)) : undefined}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const { data: lectures = [], isLoading, isError } = useGetLectures();

  const myLectures = lectures.filter(
    (l) => isLoggedIn && user && l.creatorId === user.userId,
  );
  const allLectures = lectures;

  const handleCardClick = (id: string) => {
    if (!isLoggedIn) {
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/callback`;
      window.location.href = authUrls.dgStart(redirectUri);
      return;
    }
    router.push(`/lectures/${id}`);
  };

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-10">
      {/* 제목 + 강연 생성 버튼 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">강연 목록</h1>
        {isLoggedIn && <CreateLectureButton />}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-sm text-gray-400 py-20 text-center">
          강연 목록을 불러올 수 없습니다.
        </p>
      ) : (
        <>
          {/* 내가 생성한 강연 */}
          {isLoggedIn && myLectures.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-800">
                내가 생성한 강연
              </h2>
              <LectureGrid lectures={myLectures} onCardClick={handleCardClick} />
            </section>
          )}

          {/* 전체 강연 */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-800">전체 강연</h2>
            <LectureGrid lectures={allLectures} onCardClick={handleCardClick} />
          </section>
        </>
      )}
    </main>
  );
}
