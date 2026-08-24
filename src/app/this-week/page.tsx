"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import SeatMeter from "@/components/lecture/SeatMeter";
import DeadlineCountdown from "@/components/lecture/DeadlineCountdown";
import PageShell from "@/components/layout/PageShell";
import CreateLectureButton from "@/components/lecture/CreateLectureButton";
import useAuthStore from "@/stores/authStore";
import {
  getDisplayLectureStatus,
  useGetLectures,
  useEnrollLecture,
  useCancelEnrollment,
  useGetEnrollments,
  MOCK_LECTURES,
  getMockEnrollments,
} from "@/entities/lecture";
import type { EnrollmentApplicant, LectureType } from "@/entities/lecture";
import { MOCK_USER } from "@/entities/auth";
import { LECTURE_STATUS_TO_BADGE } from "@/constants/lecture";
import { useDesignPreview } from "@/shared/lib/useDesignPreview";
import {
  formatLectureDate,
  formatLectureTime,
} from "@/shared/lib/formatLectureSchedule";

/**
 * 이번 주에 결정할 강연 하나를 고릅니다.
 * 아직 신청을 받는 강연 중 마감이 가장 가까운 것을 쓰고, 그런 강연이 없으면
 * 열려는 있지만 마감만 지난 것 중 가장 가까운 것을 씁니다.
 */
function pickFeatured(lectures: LectureType[]) {
  const live = lectures.filter((l) => {
    const status = getDisplayLectureStatus(l);
    return status === "OPEN" || status === "CONFIRMED";
  });
  if (live.length === 0) return null;

  const key = (l: LectureType) =>
    new Date(l.applicationDeadline ?? l.lectureDate ?? "9999-12-31").getTime();

  const now = Date.now();
  const stillTakingApplications = live.filter((l) => key(l) > now);
  const pool = stillTakingApplications.length ? stillTakingApplications : live;

  return [...pool].sort((a, b) => key(a) - key(b))[0];
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-base font-bold text-gray-900">{value}</dd>
    </div>
  );
}

function NameList({
  heading,
  count,
  applicants,
  emptyMessage,
}: {
  heading: string;
  count: string;
  applicants: EnrollmentApplicant[];
  emptyMessage: string;
}) {
  return (
    <section className="flex min-w-0 flex-col">
      <div className="flex items-baseline gap-2.5">
        <h2 className="text-sm font-bold text-gray-900">{heading}</h2>
        <span className="tnum text-sm text-gray-500">{count}</span>
      </div>
      {applicants.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <ul className="mt-2 flex flex-col">
          {applicants.map((applicant, index) => (
            <li
              key={applicant.userId}
              className="flex items-baseline gap-3 py-2.5"
            >
              <span className="tnum w-5 shrink-0 text-xs text-gray-400">
                {index + 1}
              </span>
              <span className="truncate text-sm font-semibold text-gray-900">
                {applicant.name}
              </span>
              <span className="tnum shrink-0 text-xs text-gray-500">
                {applicant.studentNumber}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ThisWeekPage() {
  const { user: loggedInUser, initFromSession, isLoggedIn } = useAuthStore();
  const isPreview = useDesignPreview();

  useEffect(() => {
    initFromSession();
  }, [initFromSession]);

  const { data: fetchedLectures = [], isLoading } = useGetLectures();

  const user = isPreview ? MOCK_USER : loggedInUser;
  const lectures = isPreview ? MOCK_LECTURES : fetchedLectures;
  const lecture = useMemo(() => pickFeatured(lectures), [lectures]);
  const lectureId = lecture?.lectureId ?? 0;

  const { data: fetchedEnrollments } = useGetEnrollments(lectureId);
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

  if (isLoading && !isPreview) return <Spinner />;

  if (!lecture) {
    return (
      <PageShell className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          이번 주엔 열린 강연이 없습니다
        </h1>
        <p className="max-w-[40ch] text-sm leading-relaxed text-gray-600">
          아무도 강연을 열지 않았습니다. 나눠 줄 만한 걸 알고 있다면 이번 주는
          당신 차례입니다.
        </p>
        {(isLoggedIn || isPreview) && <CreateLectureButton />}
      </PageShell>
    );
  }

  const displayStatus = getDisplayLectureStatus(lecture);
  const totalCapacity =
    lecture.totalCapacity ??
    (lecture.capacityByGrade?.["1"] ?? 0) +
      (lecture.capacityByGrade?.["2"] ?? 0) +
      (lecture.capacityByGrade?.["3"] ?? 0);
  const seatsLeft = Math.max(totalCapacity - lecture.enrolledCount, 0);
  const isFull = lecture.enrolledCount >= totalCapacity;
  const isCreator = user?.userId === lecture.creatorId;
  const otherCount = lectures.length - 1;

  const facts = [
    { label: "장소", value: lecture.lectureLocation },
    { label: "날짜", value: formatLectureDate(lecture.lectureDate) },
    { label: "시간", value: formatLectureTime(lecture.lectureTime) },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <PageShell size="narrow">
      <div className="flex flex-wrap items-center gap-4">
        <span className="rounded-lg bg-main px-2.5 py-1 text-xs font-bold text-gray-900">
          이번 주 강연
        </span>
        <Badge variant={LECTURE_STATUS_TO_BADGE[displayStatus]} />
      </div>

      <h1 className="mt-6 max-w-[16ch] text-[44px] font-bold leading-[1.1] tracking-[-0.03em] text-gray-900 md:text-[72px]">
        {lecture.title}
      </h1>

      <p className="mt-5 text-base font-medium text-gray-600">
        {lecture.creatorStudentNumber
          ? `${lecture.creatorStudentNumber} ${lecture.creatorName}`
          : lecture.creatorName}
      </p>

      {/* 이 화면에서 답해야 할 두 가지. 카드에 넣지 않고 숫자 크기로만 세웁니다. */}
      <div className="mt-14 flex flex-wrap items-start gap-x-20 gap-y-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-600">남은 자리</span>
          <div className="flex items-baseline gap-2.5">
            <span
              className={`tnum text-[60px] font-bold leading-[0.9] tracking-[-0.04em] ${
                seatsLeft === 0 ? "text-gray-300" : "text-gray-900"
              }`}
            >
              {seatsLeft}
            </span>
            <span className="tnum text-lg text-gray-500">
              / {totalCapacity}자리
            </span>
          </div>
        </div>

        {lecture.applicationDeadline && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-600">
              신청 마감까지
            </span>
            <DeadlineCountdown
              deadline={lecture.applicationDeadline}
              className="text-[60px] leading-[0.9] tracking-[-0.03em]"
            />
          </div>
        )}
      </div>

      <SeatMeter
        enrolled={lecture.enrolledCount}
        capacity={totalCapacity}
        className="mt-8 h-2 rounded-full"
      />
      <p className="tnum mt-3 text-sm text-gray-600">
        {lecture.enrolledCount}명 신청
        {lecture.waitingCount > 0 ? ` · 대기 ${lecture.waitingCount}명` : ""}
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
        {isCreator ? (
          <Button
            variant="waiting"
            disabled
            className="w-full max-w-[280px] py-4"
          >
            내가 개설한 강연입니다
          </Button>
        ) : enrollStatus ? (
          <>
            <Button
              variant="cancel"
              onClick={() => cancelEnrollment()}
              disabled={isCancelling}
              className="w-full max-w-[280px] py-4"
            >
              {isCancelling ? "취소하는 중" : "신청 취소"}
            </Button>
            <span className="text-sm font-semibold text-gray-900">
              {enrollStatus === "ENROLLED" ? "신청했습니다" : "대기 중입니다"}
            </span>
          </>
        ) : (
          <Button
            onClick={() => enrollLecture()}
            disabled={isEnrolling}
            className="w-full max-w-[280px] py-4 text-base"
          >
            {isEnrolling
              ? "신청하는 중"
              : isFull
                ? "대기로 신청하기"
                : "신청하기"}
          </Button>
        )}

        {enrollResult === "ERROR" && (
          <span className="text-sm text-error">
            신청하지 못했습니다. 잠시 후 다시 시도해 주세요.
          </span>
        )}
      </div>

      {facts.length > 0 && (
        <dl className="mt-16 flex flex-wrap gap-x-20 gap-y-6">
          {facts.map((fact) => (
            <Fact key={fact.label} {...fact} />
          ))}
        </dl>
      )}

      <p className="mt-12 max-w-[62ch] whitespace-pre-wrap break-words text-[17px] leading-9 text-gray-700">
        {lecture.description}
      </p>

      <div className="mt-20 grid gap-x-20 gap-y-12 sm:grid-cols-2">
        <NameList
          heading="신청자"
          count={`${lecture.enrolledCount}/${totalCapacity}`}
          applicants={enrollments?.enrolled ?? []}
          emptyMessage="아직 신청자가 없습니다."
        />
        <NameList
          heading="대기자"
          count={String(lecture.waitingCount)}
          applicants={enrollments?.waiting ?? []}
          emptyMessage="정원이 차면 대기자가 표시됩니다."
        />
      </div>

      {otherCount > 0 && (
        <Link
          href="/"
          className="focusable mt-16 inline-block w-fit rounded-lg text-sm font-medium text-gray-600 underline underline-offset-4 transition-colors hover:text-gray-900"
        >
          지난 강연까지 {otherCount}개 모두 보기
        </Link>
      )}
    </PageShell>
  );
}
