"use client";

import { useState, useMemo } from "react";
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
} from "@/entities/lecture";
import { LECTURE_STATUS_TO_BADGE } from "@/constants/lecture";
import {
  formatLectureDate,
  formatLectureTime,
} from "@/shared/lib/formatLectureSchedule";

export default function LectureDetailPage() {
  const params = useParams();
  const lectureId = Number(params.lectureId);
  const { user, accessToken } = useAuthStore();

  const { data: lecture, isLoading } = useGetLecture(lectureId);
  const { data: enrollments } = useGetEnrollments(lectureId);

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
  if (!accessToken || isLoading) return <Spinner />;
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
  const isPast = displayStatus === "CLOSED" || displayStatus === "UNCONFIRMED";

  const rawGrade = user?.studentNumber?.charAt(0);
  const userGrade =
    rawGrade === "1" || rawGrade === "2" || rawGrade === "3"
      ? rawGrade
      : undefined;
  const isGradeCapacityBlocked =
    usesGradeCapacity &&
    userGrade !== undefined &&
    (lecture.capacityByGrade?.[userGrade] ?? -1) === 0;

  const [deadlineDate, deadlineTime] = (
    lecture.applicationDeadline ?? ""
  ).split("T");
  const deadlineText = [
    formatLectureDate(deadlineDate),
    formatLectureTime(deadlineTime),
  ]
    .filter(Boolean)
    .join(" ");

  // 제목 아래는 강연자 한 줄, 그 아래 "언제·어디서" 한 줄로만 둡니다. 마감 일시는
  // 신청 버튼 아래로 내려서 상단이 값 목록처럼 보이지 않게 합니다.
  const scheduleText = [
    formatLectureDate(lecture.lectureDate),
    formatLectureTime(lecture.lectureTime),
  ]
    .filter(Boolean)
    .join(" ");
  const speakerText = lecture.creatorStudentNumber
    ? `${lecture.creatorStudentNumber} ${lecture.creatorName}`
    : lecture.creatorName;
  // 강연자·일정·장소를 한 줄에 두되, 이름만 진하게 해서 시선이 먼저 걸리게 합니다.
  const metaParts = [
    { text: speakerText, strong: true },
    { text: scheduleText, strong: false },
    { text: lecture.lectureLocation ?? "", strong: false },
  ].filter((part) => Boolean(part.text));

  const enrollAction = isCreator ? (
    <Button variant="waiting" disabled className="w-full py-3">
      내가 개설한 강연입니다
    </Button>
  ) : isGradeCapacityBlocked ? (
    <Button variant="waiting" disabled className="w-full py-3">
      다른 학년만 신청할 수 있습니다
    </Button>
  ) : isPast ? (
    <Button variant="waiting" disabled className="w-full py-3">
      {displayStatus === "UNCONFIRMED" ? "개설 불확정" : "강연 종료"}
    </Button>
  ) : enrollStatus === "ENROLLED" || enrollStatus === "WAITING" ? (
    <>
      {/* 이미 신청한 사람에게는 버튼보다 지금 상태가 먼저 보여야 합니다. */}
      <p className="rounded-xl bg-main-soft py-2.5 text-center text-sm font-bold text-gray-900">
        {enrollStatus === "ENROLLED" ? "신청했습니다" : "대기 중입니다"}
      </p>
      <Button
        variant="cancel"
        onClick={() => cancelEnrollment()}
        disabled={isCancelling}
        className="w-full py-3"
      >
        {isCancelling
          ? "취소하는 중"
          : enrollStatus === "ENROLLED"
            ? "신청 취소"
            : "대기 취소"}
      </Button>
    </>
  ) : (
    <Button
      onClick={() => enrollLecture()}
      disabled={isEnrolling}
      className="w-full py-3 text-base"
    >
      {isEnrolling ? "신청하는 중" : isFull ? "대기로 신청하기" : "신청하기"}
    </Button>
  );

  return (
    <PageShell size="narrow">
      <BackLink href="/lectures">전체 강연</BackLink>

      <div className="mt-6 flex flex-col md:mt-8">
        <div className="flex flex-wrap items-center gap-4">
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

        <h1 className="mt-4 text-[40px] font-bold leading-[1.15] tracking-[-0.03em] text-gray-900 md:text-[52px]">
          {lecture.title}
        </h1>

        <p className="mt-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[15px]">
          {metaParts.map((part, index) => (
            <span
              key={`${index}-${part.text}`}
              className={
                part.strong ? "font-semibold text-gray-900" : "text-gray-600"
              }
            >
              {index > 0 && (
                <span aria-hidden className="mr-2.5 text-gray-300">
                  ·
                </span>
              )}
              {part.text}
            </span>
          ))}
        </p>

        {/* 카드로 묶는 대신 이번 주 강연 화면과 같게 펼쳐 둡니다. 판단에 쓰는
            숫자 두 개를 나란히 크게 놓는 편이 카드 테두리보다 잘 읽힙니다. */}
        <div className="mt-10 flex flex-wrap items-start gap-x-16 gap-y-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-500">남은 자리</span>
            <div className="flex items-baseline gap-2">
              <span
                className={`tnum text-[32px] font-bold leading-[0.95] tracking-[-0.03em] ${
                  seatsLeft === 0 ? "text-gray-300" : "text-gray-900"
                }`}
              >
                {seatsLeft}
              </span>
              <span className="tnum text-sm text-gray-500">
                / {totalCapacity}자리
              </span>
            </div>
          </div>

          {lecture.applicationDeadline && displayStatus !== "CLOSED" && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-500">
                신청 마감까지
              </span>
              <DeadlineCountdown
                deadline={lecture.applicationDeadline}
                className="text-[32px] leading-[0.95] tracking-[-0.02em]"
              />
            </div>
          )}
        </div>

        {/* 폭이 넓으면 마감 카운트다운의 진행 바로 읽히기 쉬워서, 바로 위에
            무엇에 대한 게이지인지 라벨을 답니다. */}
        <div className="mt-9 flex items-baseline justify-between gap-4">
          <span className="text-xs font-medium text-gray-500">신청 현황</span>
          <span className="tnum text-xs text-gray-500">
            {lecture.enrolledCount}명 신청
            {lecture.waitingCount > 0
              ? ` · 대기 ${lecture.waitingCount}명`
              : ""}
          </span>
        </div>
        <SeatMeter
          enrolled={lecture.enrolledCount}
          capacity={totalCapacity}
          muted={isPast}
          className="mt-2.5 h-2 rounded-full"
        />
        {usesGradeCapacity && (
          <p className="tnum mt-2 text-right text-xs text-gray-500">
            {(["1", "2", "3"] as const)
              .map((g) => `${g}학년 ${lecture.capacityByGrade![g] ?? 0}`)
              .join(" · ")}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-2">
          {enrollAction}
          {enrollResult === "ERROR" && (
            <p className="text-center text-sm text-error">
              신청하지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          )}
          {lecture.applicationDeadline && displayStatus !== "CLOSED" && (
            <p className="tnum text-center text-xs text-gray-500">
              {deadlineText} 마감
            </p>
          )}
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-900">
            강연 소개
          </h2>
          <p className="mt-5 whitespace-pre-wrap break-words text-[19px] leading-9 text-gray-800">
            {lecture.description}
          </p>
        </section>

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
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
    </PageShell>
  );
}
