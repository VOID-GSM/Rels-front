"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { getDisplayLectureStatus, useGetLectures } from "@/entities/lecture";
import type { LectureType, LectureStatusType } from "@/entities/lecture";
import LectureCard from "@/components/common/LectureCard";
import CreateLectureButton from "@/components/common/CreateLectureButton";

type LectureCategoryKey = "all" | "open" | "confirmed" | "past";

const LECTURE_CATEGORIES: {
  key: LectureCategoryKey;
  label: string;
  matches: (status: LectureStatusType) => boolean;
}[] = [
  { key: "all", label: "전체", matches: () => true },
  { key: "open", label: "신청 가능", matches: (status) => status === "OPEN" },
  {
    key: "confirmed",
    label: "개설 확정",
    matches: (status) => status === "CONFIRMED",
  },
  {
    key: "past",
    label: "지난 강의",
    matches: (status) => status === "CLOSED" || status === "UNCONFIRMED",
  },
];

const STATUS_TO_BADGE: Record<
  LectureStatusType,
  "open" | "confirmed" | "closed" | "unconfirmed"
> = {
  OPEN: "open",
  CONFIRMED: "confirmed",
  CLOSED: "closed",
  UNCONFIRMED: "unconfirmed",
};

const STATUS_SORT_ORDER: Record<LectureStatusType, number> = {
  CONFIRMED: 0,
  OPEN: 1,
  UNCONFIRMED: 2,
  CLOSED: 3,
};

const sortLectures = (lectures: LectureType[]) =>
  [...lectures].sort(
    (a, b) =>
      STATUS_SORT_ORDER[getDisplayLectureStatus(a)] -
      STATUS_SORT_ORDER[getDisplayLectureStatus(b)],
  );

function LectureGrid({
  lectures,
  onCardClick,
}: {
  lectures: LectureType[];
  onCardClick?: (id: string) => void;
}) {
  if (lectures.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        해당 카테고리에 등록된 강연이 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,300px))] gap-4">
      {sortLectures(lectures).map((lecture) => (
        <LectureCard
          key={lecture.lectureId}
          id={String(lecture.lectureId)}
          title={lecture.title}
          speaker={
            lecture.creatorStudentNumber
              ? `${lecture.creatorStudentNumber} ${lecture.creatorName}`
              : lecture.creatorName
          }
          status={STATUS_TO_BADGE[getDisplayLectureStatus(lecture)]}
          currentCount={lecture.enrolledCount}
          maxCount={
            lecture.totalCapacity ??
            (lecture.capacityByGrade?.["1"] ?? 0) +
              (lecture.capacityByGrade?.["2"] ?? 0) +
              (lecture.capacityByGrade?.["3"] ?? 0)
          }
          waitingCount={lecture.waitingCount}
          onClick={
            onCardClick
              ? () => onCardClick(String(lecture.lectureId))
              : undefined
          }
        />
      ))}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, isLoggedIn, accessToken, initFromSession } = useAuthStore();
  const { data: lectures = [], isLoading, isError } = useGetLectures();
  const [selectedCategory, setSelectedCategory] = useState<LectureCategoryKey>(
    () => {
      if (typeof window === "undefined") return "all";
      const saved = localStorage.getItem("lectureCategory");
      return (saved as LectureCategoryKey) ?? "all";
    },
  );

  const handleCategoryChange = (key: LectureCategoryKey) => {
    setSelectedCategory(key);
    localStorage.setItem("lectureCategory", key);
  };

  useEffect(() => {
    const token = initFromSession();
    if (!token) {
      router.replace("/login");
    }
  }, [initFromSession, router]);

  const myLectures = lectures.filter(
    (lecture) => isLoggedIn && user && lecture.creatorId === user.userId,
  );
  const filteredLectures = useMemo(() => {
    const selectedCategoryInfo =
      LECTURE_CATEGORIES.find((category) => category.key === selectedCategory) ??
      LECTURE_CATEGORIES[0];

    return lectures.filter((lecture) =>
      selectedCategoryInfo.matches(getDisplayLectureStatus(lecture)),
    );
  }, [lectures, selectedCategory]);

  const handleCardClick = (id: string) => {
    router.push(`/lectures/${id}`);
  };

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
        <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-10 flex flex-col gap-10">
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
          {isLoggedIn && myLectures.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-800">
                내가 생성한 강연
              </h2>
              <LectureGrid
                lectures={myLectures}
                onCardClick={handleCardClick}
              />
            </section>
          )}

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                전체 강연
              </h2>
              <div className="flex flex-wrap gap-2">
                {LECTURE_CATEGORIES.map((category) => {
                  const isActive = selectedCategory === category.key;

                  return (
                    <button
                      key={category.key}
                      type="button"
                      onClick={() => handleCategoryChange(category.key)}
                      className={`h-9 rounded-lg border px-4 text-sm font-medium transition-colors ${
                        isActive
                          ? "border-main bg-main text-black"
                          : "border-main-200 bg-white text-gray-600 hover:bg-main-100"
                      }`}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <LectureGrid
              lectures={filteredLectures}
              onCardClick={handleCardClick}
            />
          </section>
        </>
      )}
    </main>
  );
}
