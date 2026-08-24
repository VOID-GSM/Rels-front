"use client";

import { useEffect, useMemo, useState } from "react";
import useAuthStore from "@/stores/authStore";
import {
  getDisplayLectureStatus,
  useGetLectures,
  MOCK_LECTURES,
  MOCK_USER_ID,
} from "@/entities/lecture";
import type { LectureType, LectureStatusType } from "@/entities/lecture";
import LectureCard from "@/components/lecture/LectureCard";
import Spinner from "@/components/common/Spinner";
import CreateLectureButton from "@/components/lecture/CreateLectureButton";
import PageShell from "@/components/layout/PageShell";
import PageHeader from "@/components/layout/PageHeader";
import BackLink from "@/components/layout/BackLink";
import { useDesignPreview } from "@/shared/lib/useDesignPreview";
import {
  LECTURE_STATUS_TO_BADGE,
  LECTURE_STATUS_SORT_ORDER,
} from "@/constants/lecture";

type LectureCategoryKey = "all" | "open" | "confirmed" | "past";

const LECTURE_CATEGORIES: {
  key: LectureCategoryKey;
  label: string;
  matches: (status: LectureStatusType) => boolean;
}[] = [
  { key: "all", label: "전체", matches: () => true },
  { key: "open", label: "신청 가능", matches: (s) => s === "OPEN" },
  { key: "confirmed", label: "개설 확정", matches: (s) => s === "CONFIRMED" },
  {
    key: "past",
    label: "지난 강연",
    matches: (s) => s === "CLOSED" || s === "UNCONFIRMED",
  },
];

const sortLectures = (lectures: LectureType[]) =>
  [...lectures].sort(
    (a, b) =>
      LECTURE_STATUS_SORT_ORDER[getDisplayLectureStatus(a)] -
      LECTURE_STATUS_SORT_ORDER[getDisplayLectureStatus(b)],
  );

const getTotalCapacity = (lecture: LectureType) =>
  lecture.totalCapacity ??
  (lecture.capacityByGrade?.["1"] ?? 0) +
    (lecture.capacityByGrade?.["2"] ?? 0) +
    (lecture.capacityByGrade?.["3"] ?? 0);

function LectureGrid({ lectures }: { lectures: LectureType[] }) {
  if (lectures.length === 0) {
    return (
      <p className="rounded-2xl bg-surface px-6 py-16 text-center text-sm text-gray-500 shadow-e1">
        아직 이 조건에 맞는 강연이 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(264px,1fr))] gap-5">
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
          status={LECTURE_STATUS_TO_BADGE[getDisplayLectureStatus(lecture)]}
          currentCount={lecture.enrolledCount}
          maxCount={getTotalCapacity(lecture)}
          waitingCount={lecture.waitingCount}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const { user, isLoggedIn, initFromSession } = useAuthStore();
  const { data: fetchedLectures = [], isLoading, isError } = useGetLectures();
  const [selectedCategory, setSelectedCategory] = useState<LectureCategoryKey>(
    () => {
      if (typeof window === "undefined") return "all";
      return (
        (localStorage.getItem("lectureCategory") as LectureCategoryKey) ?? "all"
      );
    },
  );

  // 로그인 없이도 열람할 수 있는 페이지이므로 세션 복원만 하고 이동시키지 않습니다.
  useEffect(() => {
    initFromSession();
  }, [initFromSession]);

  // 디자인 작업용 임시 처리: 비로그인 상태에서는 목 데이터로 화면을 채웁니다.
  const isPreview = useDesignPreview();
  const lectures = isPreview ? MOCK_LECTURES : fetchedLectures;

  const myLectures = lectures.filter((l) =>
    isPreview
      ? l.creatorId === MOCK_USER_ID
      : isLoggedIn && user && l.creatorId === user.userId,
  );

  const openCount = lectures.filter(
    (l) => getDisplayLectureStatus(l) === "OPEN",
  ).length;

  const filteredLectures = useMemo(() => {
    const cat =
      LECTURE_CATEGORIES.find((c) => c.key === selectedCategory) ??
      LECTURE_CATEGORIES[0];
    return lectures.filter((l) => cat.matches(getDisplayLectureStatus(l)));
  }, [lectures, selectedCategory]);

  const handleCategoryChange = (key: LectureCategoryKey) => {
    setSelectedCategory(key);
    localStorage.setItem("lectureCategory", key);
  };

  return (
    <PageShell>
      <BackLink href="/">이번 주 강연</BackLink>
      <PageHeader
        className="mt-5 pb-10"
        title="전체 강연"
        description={
          isLoading && !isPreview
            ? "불러오는 중"
            : `학생이 직접 여는 릴레이 스터디입니다. 지금까지 ${lectures.length}개가 열렸고, ${openCount}개를 신청할 수 있습니다.`
        }
        actions={(isLoggedIn || isPreview) && <CreateLectureButton />}
      />

      {isLoading && !isPreview ? (
        <Spinner className="py-20" />
      ) : isError && !isPreview ? (
        <p className="rounded-2xl bg-surface px-6 py-20 text-center text-sm text-gray-600 shadow-e1">
          강연 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : (
        <div className="flex flex-col gap-14">
          {(isLoggedIn || isPreview) && myLectures.length > 0 && (
            <section className="flex flex-col gap-5">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-base font-bold text-gray-900">
                  내가 개설한 강연
                </h2>
                <span className="tnum text-sm text-gray-500">
                  {myLectures.length}
                </span>
              </div>
              <LectureGrid lectures={myLectures} />
            </section>
          )}

          <section className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-base font-bold text-gray-900">전체 강연</h2>
                <span className="tnum text-sm text-gray-500">
                  {filteredLectures.length}
                </span>
              </div>
              <div className="inline-flex gap-0.5 rounded-xl bg-gray-100 p-1">
                {LECTURE_CATEGORIES.map((category) => (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => handleCategoryChange(category.key)}
                    className={`focusable rounded-lg px-3.5 py-1.5 text-sm font-medium transition-[background-color,box-shadow,color] ${
                      selectedCategory === category.key
                        ? "bg-surface text-gray-900 shadow-e1"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
            <LectureGrid lectures={filteredLectures} />
          </section>
        </div>
      )}
    </PageShell>
  );
}
