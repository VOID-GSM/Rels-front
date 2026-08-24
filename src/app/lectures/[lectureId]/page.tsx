"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import SeatMeter from "@/components/lecture/SeatMeter";
import PageShell from "@/components/layout/PageShell";
import BackLink from "@/components/layout/BackLink";

const ApplicantList = dynamic(
  () => import("@/components/lecture/ApplicantList"),
  {
    loading: () => (
      <div className="h-32 w-full animate-pulse rounded-2xl bg-surface shadow-e1" />
    ),
  },
);
import Pencil from "@/assets/svg/Pencil";
import DeadlineCountdown from "@/components/lecture/DeadlineCountdown";
import useAuthStore from "@/stores/authStore";
import {
  getDisplayLectureStatus,
  useGetLecture,
  useEnrollLecture,
  useCancelEnrollment,
  useGetEnrollments,
  MOCK_LECTURES,
  getMockEnrollments,
} from "@/entities/lecture";
import { MOCK_USER } from "@/entities/auth";
import { LECTURE_STATUS_TO_BADGE } from "@/constants/lecture";
import { useDesignPreview } from "@/shared/lib/useDesignPreview";
import {
  formatLectureDate,
  formatLectureTime,
} from "@/shared/lib/formatLectureSchedule";

/** 장소·날짜·시간처럼 짧은 값은 라벨 위, 값 아래로 쌓아 가로로 늘어놓습니다. */
function FactItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

export default function LectureDetailPage() {
  const params = useParams();
  const lectureId = Number(params.lectureId);
  const { user: loggedInUser, initFromSession, accessToken } = useAuthStore();
  // 디자인 작업용 임시 처리: 비로그인 상태에서는 목 데이터로 상세를 보여줍니다.
  const isPreview = useDesignPreview();

  useEffect(() => {
    initFromSession();
  }, [initFromSession]);

  const { data: fetchedLecture, isLoading } = useGetLecture(lectureId);
  const { data: fetchedEnrollments } = useGetEnrollments(lectureId);

  const user = isPreview ? MOCK_USER : loggedInUser;
  const lecture = isPreview
    ? MOCK_LECTURES.find((l) => l.lectureId === lectureId)
    : fetchedLecture;
  const enrollments = isPreview
    ? getMockEnrollments(lectureId)
    : fetchedEnrollments;

  const [enrollResult, setEnrollResult] = useState<
    "ENROLLED" | "WAITING" | "ERROR" | null
  >(null);

  const { mutate: enrollLecture, isPending: isEnrolling } = useEnrollLecture(
    lectureId,
    {
      onSuccess: (data) => setEnrollResult(data.enrollmentStatus),
      onError: () => setEnrollResult("ERROR"),
    },
  );
  const { mutate: cancelEnrollment, isPending: isCancelling } =
    useCancelEnrollment(lectureId, {
      onSuccess: () => setEnrollResult(null),
      onError: () => setEnrollResult("ERROR"),
    });

  const enrollStatus = useMemo<"ENROLLED" | "WAITING" | null>(() => {
    if (enrollResult === "ENROLLED" || enrollResult === "WAITING")
      return enrollResult;
    if (enrollResult === "ERROR") return null;
    if (!enrollments || !user) return null;
    if (enrollments.enrolled.some((a) => a.userId === user.userId))
      return "ENROLLED";
    if (enrollments.waiting.some((a) => a.userId === user.userId))
      return "WAITING";
    return null;
  }, [enrollResult, enrollments, user]);

  if (isNaN(lectureId)) return notFound();
  if (!isPreview && (!accessToken || isLoading)) return <Spinner />;
  if (!lecture) return notFound();

  const isCreator = user?.userId === lecture.creatorId;
  const isAdmin = user?.role === "ADMIN";
  const displayStatus = getDisplayLectureStatus(lecture);

  const totalCapacity =
    lecture.totalCapacity ??
    (lecture.capacityByGrade?.["1"] ?? 0) +
      (lecture.capacityByGrade?.["2"] ?? 0) +
      (lecture.capacityByGrade?.["3"] ?? 0);
  const usesGradeCapacity =
    lecture.totalCapacity == null && lecture.capacityByGrade != null;
  const isFull = lecture.enrolledCount >= totalCapacity;
  const seatsLeft = Math.max(totalCapacity - lecture.enrolledCount, 0);
  const isPast =
    displayStatus === "CLOSED" || displayStatus === "UNCONFIRMED";

  const rawGrade = user?.studentNumber?.charAt(0);
  const userGrade =
    rawGrade === "1" || rawGrade === "2" || rawGrade === "3"
      ? rawGrade
      : undefined;
  const isGradeCapacityBlocked =
    usesGradeCapacity &&
    userGrade !== undefined &&
    (lecture.capacityByGrade?.[userGrade] ?? -1) === 0;

  const facts = [
    { label: "장소", value: lecture.lectureLocation },
    { label: "날짜", value: formatLectureDate(lecture.lectureDate) },
    { label: "시간", value: formatLectureTime(lecture.lectureTime) },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  const enrollAction = isCreator ? (
    <Button variant="waiting" disabled className="w-full py-3.5">
      내가 개설한 강연입니다
    </Button>
  ) : isGradeCapacityBlocked ? (
    <Button variant="waiting" disabled className="w-full py-3.5">
      다른 학년만 신청할 수 있습니다
    </Button>
  ) : isPast ? (
    <Button variant="waiting" disabled className="w-full py-3.5">
      {displayStatus === "UNCONFIRMED" ? "개설 불확정" : "강연 종료"}
    </Button>
  ) : enrollStatus === "ENROLLED" || enrollStatus === "WAITING" ? (
    <Button
      variant="cancel"
      onClick={() => cancelEnrollment()}
      disabled={isCancelling}
      className="w-full py-3.5"
    >
      {isCancelling
        ? "취소하는 중"
        : enrollStatus === "ENROLLED"
          ? "신청 취소"
          : "대기 취소"}
    </Button>
  ) : (
    <Button
      onClick={() => enrollLecture()}
      disabled={isEnrolling}
      className="w-full py-3.5"
    >
      {isEnrolling ? "신청하는 중" : isFull ? "대기로 신청" : "신청하기"}
    </Button>
  );

  return (
    <PageShell>
      <BackLink href="/">강연 목록</BackLink>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        {/* 본문 — 카드에 담지 않고 캔버스 위에 그대로 흐르게 둡니다. */}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-5">
            <Badge variant={LECTURE_STATUS_TO_BADGE[displayStatus]} />
            {(isCreator || isAdmin) && (
              <Link
                href={`/lectures/${lectureId}/edit`}
                className="focusable inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-gray-600 transition-colors hover:text-gray-900"
              >
                <Pencil />
                수정
              </Link>
            )}
          </div>

          <h1 className="mt-3 max-w-[22ch] text-3xl font-bold leading-[1.2] text-gray-900 md:text-[40px]">
            {lecture.title}
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            {lecture.creatorStudentNumber
              ? `${lecture.creatorStudentNumber} ${lecture.creatorName}`
              : lecture.creatorName}
          </p>

          {facts.length > 0 && (
            <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5">
              {facts.map((fact) => (
                <FactItem key={fact.label} {...fact} />
              ))}
              {usesGradeCapacity && (
                <FactItem
                  label="학년별 정원"
                  value={(["1", "2", "3"] as const)
                    .map((g) => `${g}학년 ${lecture.capacityByGrade![g] ?? 0}`)
                    .join(" · ")}
                />
              )}
            </dl>
          )}

          <p className="mt-8 max-w-[70ch] whitespace-pre-wrap break-words text-[15px] leading-8 text-gray-700">
            {lecture.description}
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <ApplicantList
              type="applicant"
              currentCount={lecture.enrolledCount}
              maxCount={totalCapacity}
              applicants={enrollments?.enrolled ?? []}
            />
            <ApplicantList
              type="waiting"
              waitingCount={lecture.waitingCount}
              applicants={enrollments?.waiting ?? []}
            />
          </div>
        </div>

        {/* 신청 패널 — 스크롤을 따라오는 오른쪽 레일 */}
        <aside className="lg:sticky lg:top-[94px] lg:h-fit">
          <div className="flex flex-col gap-5 rounded-2xl bg-surface p-6 shadow-e2">
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-semibold tracking-wide text-gray-600">
                  신청 현황
                </span>
                <span className="tnum text-sm text-gray-600">
                  <span className="text-base font-bold text-gray-900">
                    {lecture.enrolledCount}
                  </span>
                  <span className="text-gray-500"> / {totalCapacity}명</span>
                </span>
              </div>
              <SeatMeter
                enrolled={lecture.enrolledCount}
                capacity={totalCapacity}
                muted={isPast}
                className="h-1 rounded-full"
              />
              <p className="tnum text-xs text-gray-600">
                {isFull
                  ? `정원이 찼습니다 · 대기 ${lecture.waitingCount}명`
                  : `${seatsLeft}자리 남음`}
              </p>
            </div>

            {lecture.applicationDeadline && displayStatus !== "CLOSED" && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3.5 py-3">
                <span className="text-xs text-gray-600">신청 마감까지</span>
                <DeadlineCountdown deadline={lecture.applicationDeadline} />
              </div>
            )}

            {enrollAction}

            {enrollResult === "ERROR" && (
              <p className="text-center text-xs text-error">
                신청하지 못했습니다. 잠시 후 다시 시도해 주세요.
              </p>
            )}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
