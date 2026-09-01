"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import MarkdownContent from "@/components/common/MarkdownContent";
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

const AttendanceList = dynamic(
  () => import("@/components/lecture/AttendanceList"),
  {
    loading: () => (
      <div className="h-32 w-full animate-pulse rounded-2xl bg-surface shadow-e1" />
    ),
  },
);

const ConfirmModal = dynamic(() => import("@/components/common/ConfirmModal"), {
  ssr: false,
});
import { toast } from "sonner";
import Pencil from "@/assets/svg/Pencil";
import Delete from "@/assets/svg/Delete";
import DeadlineCountdown from "@/components/lecture/DeadlineCountdown";
import useAuthStore from "@/stores/authStore";
import {
  getDisplayLectureStatus,
  useGetLecture,
  useEnrollLecture,
  useCancelEnrollment,
  useGetEnrollments,
  useGetAttendances,
  useUpdateAttendances,
  useDeleteLecture,
} from "@/entities/lecture";
import { LECTURE_STATUS_TO_BADGE } from "@/constants/lecture";
import {
  formatLectureDate,
  formatLectureTime,
} from "@/shared/lib/formatLectureSchedule";
import {
  getEnrollmentOpenAt,
  formatEnrollmentOpenAt,
  isBeforeOpen,
  isAfterDeadline,
} from "@/shared/lib/enrollmentWindow";
import {
  getUserGrade,
  isGradeCapacityBlocked as checkGradeCapacityBlocked,
  usesGradeCapacity,
} from "@/shared/lib/gradeCapacity";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import {
  getEnrollmentStatus,
  isMyGradeFull as checkMyGradeFull,
  orderByRoster,
  toRoster,
} from "@/shared/lib/enrollmentRoster";

export default function LectureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = Number(params.lectureId);
  const { user, accessToken } = useAuthStore();

  const isAdmin = user?.role === "ADMIN";

  const { data: lecture, isLoading } = useGetLecture(lectureId);
  const { data: enrollments } = useGetEnrollments(lectureId);
  // 출석부는 학생회만 봅니다. 그 외 계정은 요청 자체를 보내지 않습니다.
  const {
    data: attendances,
    isLoading: isLoadingAttendances,
    isError: isAttendancesError,
  } = useGetAttendances(lectureId, { enabled: isAdmin });
  const { mutate: saveAttendances, isPending: isSavingAttendances } =
    useUpdateAttendances(lectureId, {
      onSuccess: () => toast.success("출석을 저장했습니다."),
      onError: () =>
        toast.error("출석을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요."),
    });

  const { mutate: deleteLecture, isPending: isDeleting } = useDeleteLecture();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 카운트다운이 0에 닿는 순간 이 값이 켜지면서 신청 버튼이 풀립니다.
  const [hasEnrollmentOpened, setHasEnrollmentOpened] = useState(false);
  // 화면을 열어 둔 채 마감을 넘기면 버튼이 살아 있는 상태로 남아 서버가 거절합니다.
  // 마감 카운트다운이 0에 닿는 순간 이 값이 켜지면서 버튼이 닫힙니다.
  const [hasDeadlinePassed, setHasDeadlinePassed] = useState(false);

  const [enrollResult, setEnrollResult] = useState<
    "ENROLLED" | "WAITING" | "ERROR" | null
  >(null);
  // 서버도 16:20 이전 신청을 막습니다. "잠시 후 다시"로 뭉뚱그리면 언제 되는지
  // 알 수 없어서, 서버가 내려준 사유를 그대로 보여 줍니다.
  const [enrollErrorMessage, setEnrollErrorMessage] = useState<string | null>(
    null,
  );

  const showEnrollError = (error: unknown, fallback: string) => {
    setEnrollResult("ERROR");
    setEnrollErrorMessage(
      getApiErrorMessage(error, {
        preferServerMessage: true,
        statusMessages: { 400: fallback, 409: fallback },
      }),
    );
  };

  const { mutate: enrollLecture, isPending: isEnrolling } = useEnrollLecture(
    lectureId,
    {
      onSuccess: (data) => {
        setEnrollErrorMessage(null);
        setEnrollResult(data.enrollmentStatus);
      },
      onError: (error) =>
        showEnrollError(
          error,
          "신청하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        ),
    },
  );
  const { mutate: cancelEnrollment, isPending: isCancelling } =
    useCancelEnrollment(lectureId, {
      onSuccess: () => {
        setEnrollErrorMessage(null);
        setEnrollResult(null);
      },
      onError: (error) =>
        showEnrollError(
          error,
          "취소하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        ),
    });

  // 신청자/대기자 구분은 서버가 정합니다. 여기서는 순서만 그대로 받습니다.
  const roster = useMemo(() => toRoster(enrollments), [enrollments]);

  const enrollStatus = useMemo<"ENROLLED" | "WAITING" | null>(() => {
    // 서버가 내려준 내 신청 상태가 먼저입니다. 그다음이 명단, 마지막이 방금 누른 결과입니다.
    const mine = lecture?.myEnrollmentStatus;
    if (mine === "ENROLLED" || mine === "WAITING") return mine;

    const fromRoster = getEnrollmentStatus(roster, user?.userId);
    if (fromRoster) return fromRoster;
    if (enrollResult === "ENROLLED" || enrollResult === "WAITING")
      return enrollResult;
    return null;
  }, [lecture, roster, enrollResult, user]);

  if (isNaN(lectureId)) return notFound();
  if (!accessToken || isLoading) return <Spinner />;
  if (!lecture) return notFound();

  const isCreator = user?.userId === lecture.creatorId;
  const displayStatus = getDisplayLectureStatus(lecture);

  // 학생회 승인 전후. 아직 공개되지 않은 강연은 신청도 마감도 의미가 없어서,
  // 개설 상태 대신 승인 상태를 앞세우고 흐르는 값은 모두 멈춰 둡니다.
  const isAwaitingApproval = lecture.approvalStatus === "PENDING";
  const isRejected = lecture.approvalStatus === "REJECTED";
  const isNotPublished = isAwaitingApproval || isRejected;

  const handleConfirmDelete = () => {
    deleteLecture(lectureId, { onSuccess: () => router.push("/lectures") });
  };

  const totalCapacity =
    lecture.totalCapacity ??
    (lecture.capacityByGrade?.["1"] ?? 0) +
      (lecture.capacityByGrade?.["2"] ?? 0) +
      (lecture.capacityByGrade?.["3"] ?? 0);
  const showsGradeCapacity = usesGradeCapacity(
    lecture.totalCapacity,
    lecture.capacityByGrade,
  );
  // 내 학년에 애초에 배정된 자리가 있는지. 자리가 0이면 대기도 받지 않습니다.
  const isGradeCapacityBlocked = checkGradeCapacityBlocked({
    totalCapacity: lecture.totalCapacity,
    capacityByGrade: lecture.capacityByGrade,
    studentNumber: user?.studentNumber,
  });
  // 인원수는 서버가 센 값을 그대로 씁니다. 대기자를 신청자로 세지 않도록.
  const enrolledCount = lecture.enrolledCount;
  const waitingCount = lecture.waitingCount;
  const isFull = enrolledCount >= totalCapacity;
  const seatsLeft = Math.max(totalCapacity - enrolledCount, 0);
  // 전체 정원은 남았는데 내 학년 자리만 찬 경우입니다. 이때 들어온 신청은 대기로
  // 서고, 앞사람이 취소하면 서버가 순번대로 신청자로 올려 줍니다. 그래서 신청
  // 자체를 막지 않고, 대기로 들어간다는 것만 버튼에 적습니다.
  const isMyGradeTaken =
    !isFull &&
    checkMyGradeFull({
      enrolled: roster.enrolled,
      totalCapacity: lecture.totalCapacity,
      capacityByGrade: lecture.capacityByGrade,
      studentNumber: user?.studentNumber,
    });
  // 지금 누르면 신청자가 아니라 대기자로 들어가는 상태.
  const isWaitlistOnly = isFull || isMyGradeTaken;
  const myGrade = getUserGrade(user?.studentNumber);
  const isPast = displayStatus === "CLOSED" || displayStatus === "UNCONFIRMED";

  // 신청은 7교시가 끝나는 16:20부터 받습니다. 백엔드에 신청 시작 필드가 없어서
  // 개설 시각에서 계산합니다.
  const enrollmentOpenAt = getEnrollmentOpenAt(lecture.createdAt);
  const isBeforeEnrollmentOpen =
    !hasEnrollmentOpened && isBeforeOpen(enrollmentOpenAt);
  // 마감이 지나면 서버가 신청을 거절합니다. 신청자가 10명을 넘겨 상태가 CONFIRMED로
  // 남아 있어도 마찬가지라, 상태가 아닌 마감 시각을 보고 버튼을 닫습니다.
  const isEnrollmentClosed =
    hasDeadlinePassed || isAfterDeadline(lecture.applicationDeadline);

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

  const enrollAction = isRejected ? (
    <Button variant="waiting" disabled className="w-full py-3">
      개설이 거절된 강연입니다
    </Button>
  ) : isAwaitingApproval ? (
    <Button variant="waiting" disabled className="w-full py-3">
      학생회 확인을 기다리는 중입니다
    </Button>
  ) : isCreator ? (
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
  ) : isBeforeEnrollmentOpen && enrollmentOpenAt ? (
    <Button variant="waiting" disabled className="w-full py-3">
      {formatEnrollmentOpenAt(enrollmentOpenAt)}부터 신청
    </Button>
  ) : enrollStatus === "ENROLLED" || enrollStatus === "WAITING" ? (
    <>
      {/* 이미 신청한 사람에게는 버튼보다 지금 상태가 먼저 보여야 합니다. */}
      <p className="rounded-xl bg-main-soft py-2.5 text-center text-sm font-bold text-gray-900">
        {enrollStatus === "ENROLLED" ? "신청했습니다" : "대기 중입니다"}
      </p>
      {/* 마감 뒤에는 명단이 확정됩니다. 서버도 취소를 받지 않습니다. */}
      {isEnrollmentClosed ? (
        <p className="text-center text-xs text-gray-500">
          마감되어 취소할 수 없습니다.
        </p>
      ) : (
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
      )}
    </>
  ) : isEnrollmentClosed ? (
    <Button variant="waiting" disabled className="w-full py-3">
      신청이 마감되었습니다
    </Button>
  ) : (
    <Button
      onClick={() => enrollLecture()}
      disabled={isEnrolling}
      className="w-full py-3 text-base"
    >
      {isEnrolling
        ? "신청하는 중"
        : isWaitlistOnly
          ? "대기로 신청하기"
          : "신청하기"}
    </Button>
  );

  return (
    <>
      <PageShell size="narrow">
        <BackLink href="/lectures">전체 강연</BackLink>

        <div className="mt-6 flex flex-col md:mt-8">
          <div className="flex flex-wrap items-center gap-4">
            <Badge
              variant={
                isRejected
                  ? "rejected"
                  : isAwaitingApproval
                    ? "pending"
                    : LECTURE_STATUS_TO_BADGE[displayStatus]
              }
            />
            {(isCreator || isAdmin) && (
              <>
                <Link
                  href={`/lectures/${lectureId}/edit`}
                  className="focusable inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-gray-600 transition-colors hover:text-gray-900"
                >
                  <Pencil />
                  수정
                </Link>
                {/* 거절된 강연을 여기서 바로 정리할 수 있어야 해서 수정 옆에 둡니다. */}
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="focusable inline-flex cursor-pointer items-center gap-1.5 rounded-lg text-xs font-semibold text-gray-600 transition-colors hover:text-error"
                >
                  <Delete />
                  삭제
                </button>
              </>
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

          {/* 승인 전이면 자리·마감 숫자보다 이게 먼저 읽혀야 합니다. */}
          {isNotPublished && (
            <div
              className={`mt-8 flex flex-col gap-1.5 rounded-2xl px-5 py-4 ${
                isRejected ? "bg-error-soft" : "bg-main-soft"
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  isRejected ? "text-error" : "text-gray-900"
                }`}
              >
                {isRejected
                  ? "학생회가 개설을 거절했습니다"
                  : "학생회가 확인하고 있습니다"}
              </p>
              <p className="text-sm leading-relaxed text-gray-700">
                {isRejected
                  ? (lecture.rejectionReason ??
                    "학생회가 따로 남긴 사유가 없습니다.")
                  : "확인이 끝나면 학생들에게 공개됩니다. 그전까지는 개설자와 학생회에게만 보입니다."}
              </p>
              {isRejected && (isCreator || isAdmin) && (
                <p className="mt-1 text-xs text-gray-600">
                  위쪽 삭제로 정리할 수 있습니다.
                </p>
              )}
            </div>
          )}

          {/* 카드로 묶는 대신 이번 주 강연 화면과 같게 펼쳐 둡니다. 판단에 쓰는
            숫자 두 개를 나란히 크게 놓는 편이 카드 테두리보다 잘 읽힙니다. */}
          <div className="mt-10 flex flex-wrap items-start gap-x-16 gap-y-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-500">
                남은 자리
              </span>
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

            {/* 공개되지 않은 강연에서 카운트다운이 돌면 신청을 받고 있는 것처럼
              보입니다. 승인 전에는 시계를 멈춰 둡니다. */}
            {/* 아직 신청이 안 열렸으면 마감이 아니라 시작까지를 셉니다. */}
            {!isNotPublished &&
            isBeforeEnrollmentOpen &&
            enrollmentOpenAt &&
            !isPast ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-gray-500">
                  신청 시작까지
                </span>
                <DeadlineCountdown
                  deadline={enrollmentOpenAt.toISOString()}
                  endedLabel="신청 시작"
                  urgent={false}
                  onEnd={() => setHasEnrollmentOpened(true)}
                  className="text-[32px] leading-[0.95] tracking-[-0.02em]"
                />
              </div>
            ) : (
              lecture.applicationDeadline &&
              displayStatus !== "CLOSED" &&
              !isNotPublished && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    신청 마감까지
                  </span>
                  <DeadlineCountdown
                    deadline={lecture.applicationDeadline}
                    onEnd={() => setHasDeadlinePassed(true)}
                    className="text-[32px] leading-[0.95] tracking-[-0.02em]"
                  />
                </div>
              )
            )}
          </div>

          {/* 폭이 넓으면 마감 카운트다운의 진행 바로 읽히기 쉬워서, 바로 위에
            무엇에 대한 게이지인지 라벨을 답니다. */}
          <div className="mt-9 flex items-baseline justify-between gap-4">
            <span className="text-xs font-medium text-gray-500">신청 현황</span>
            <span className="tnum text-xs text-gray-500">
              {enrolledCount}명 신청
              {waitingCount > 0 ? ` · 대기 ${waitingCount}명` : ""}
            </span>
          </div>
          <SeatMeter
            enrolled={enrolledCount}
            capacity={totalCapacity}
            muted={isPast}
            className="mt-2.5 h-2 rounded-full"
          />
          {showsGradeCapacity && (
            <p className="tnum mt-2 text-right text-xs text-gray-500">
              {(["1", "2", "3"] as const)
                .map((g) => `${g}학년 ${lecture.capacityByGrade![g] ?? 0}`)
                .join(" · ")}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-2">
            {enrollAction}
            {/* 남은 자리가 있는데 왜 대기로 가는지 버튼만으로는 알 수 없어서 적어 둡니다. */}
            {isMyGradeTaken && !enrollStatus && !isEnrollmentClosed && (
              <p className="text-center text-xs text-gray-500">
                {myGrade}학년 자리가 모두 차서 대기자로 등록됩니다.
              </p>
            )}
            {enrollResult === "ERROR" && (
              <p className="text-center text-sm text-error">
                {enrollErrorMessage ??
                  "신청하지 못했습니다. 잠시 후 다시 시도해 주세요."}
              </p>
            )}
            {lecture.applicationDeadline &&
              displayStatus !== "CLOSED" &&
              !isRejected && (
                <p className="tnum text-center text-xs text-gray-500">
                  {deadlineText} 마감
                </p>
              )}
          </div>

          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-900">
              강연 소개
            </h2>
            <MarkdownContent className="mt-5" size="base">
              {lecture.description}
            </MarkdownContent>
          </section>

          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            {/* 학생회는 같은 신청자 카드에서 바로 출석을 찍습니다. */}
            {isAdmin ? (
              <AttendanceList
                currentCount={lecture.enrolledCount}
                maxCount={totalCapacity}
                attendances={orderByRoster(attendances ?? [], roster)}
                isLoading={isLoadingAttendances}
                isError={isAttendancesError}
                isSaving={isSavingAttendances}
                onSave={saveAttendances}
              />
            ) : (
              <ApplicantList
                type="applicant"
                currentCount={enrolledCount}
                maxCount={totalCapacity}
                applicants={roster.enrolled}
              />
            )}
            <ApplicantList
              type="waiting"
              waitingCount={waitingCount}
              applicants={roster.waiting}
              copyable={isAdmin}
            />
          </div>
        </div>
      </PageShell>

      {showDeleteModal && (
        <ConfirmModal
          title="강연 삭제"
          message="강연을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?"
          confirmLabel="삭제"
          confirmVariant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          isPending={isDeleting}
        />
      )}
    </>
  );
}
