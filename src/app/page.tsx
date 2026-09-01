"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Arrow from "@/assets/svg/Arrow";
import Pencil from "@/assets/svg/Pencil";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import { toast } from "sonner";
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
  useGetAttendances,
  useUpdateAttendances,
} from "@/entities/lecture";
import type { LectureType } from "@/entities/lecture";
import { LECTURE_STATUS_TO_BADGE } from "@/constants/lecture";
import {
  formatLectureDate,
  formatLectureTime,
} from "@/shared/lib/formatLectureSchedule";
import {
  getLectureEnrollmentOpenAt,
  formatEnrollmentOpenAt,
  isBeforeOpen,
  isAfterDeadline,
} from "@/shared/lib/enrollmentWindow";
import {
  getUserGrade,
  isGradeCapacityBlocked as checkGradeCapacityBlocked,
  usesGradeCapacity,
} from "@/shared/lib/gradeCapacity";
import {
  getEnrollmentStatus,
  isMyGradeFull as checkMyGradeFull,
  orderByRoster,
  toRoster,
} from "@/shared/lib/enrollmentRoster";

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

/**
 * 이번 주에 결정할 강연 하나를 고릅니다.
 * 아직 신청을 받는 강연 중 마감이 가장 가까운 것을 쓰고, 그런 강연이 없으면
 * 열려는 있지만 마감만 지난 것 중 가장 가까운 것을 씁니다.
 */
function pickFeatured(lectures: LectureType[]) {
  const live = lectures.filter((l) => {
    // 승인 전이거나 거절된 강연이 목록에 섞여 오면(개설자·학생회 시점) 첫 화면
    // 전체를 차지해 버립니다. 이번 주 강연은 공개된 것 중에서만 고릅니다.
    if (l.approvalStatus === "PENDING" || l.approvalStatus === "REJECTED")
      return false;

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

export default function ThisWeekPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const { data: lectures = [], isLoading } = useGetLectures();

  const lecture = useMemo(() => pickFeatured(lectures), [lectures]);
  const lectureId = lecture?.lectureId ?? 0;

  const { data: enrollments } = useGetEnrollments(lectureId);

  // 상세 페이지와 같은 규칙입니다. 출석부는 학생회만 보고, 그 외에는 요청하지 않습니다.
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

  // 카운트다운이 0에 닿는 순간 이 값이 켜지면서 신청 버튼이 풀립니다.
  const [hasEnrollmentOpened, setHasEnrollmentOpened] = useState(false);
  // 화면을 열어 둔 채 마감을 넘기면 버튼이 살아 있는 상태로 남아 서버가 거절합니다.
  // 마감 카운트다운이 0에 닿는 순간 이 값이 켜지면서 버튼이 닫힙니다.
  const [hasDeadlinePassed, setHasDeadlinePassed] = useState(false);

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

  // 신청자/대기자 구분은 서버가 정합니다. 여기서는 순서만 그대로 받습니다.
  const roster = useMemo(() => toRoster(enrollments), [enrollments]);

  const enrollStatus = useMemo<"ENROLLED" | "WAITING" | null>(() => {
    // 명단이 곧 진실입니다. 방금 누른 결과는 명단이 새로 오기 전까지만 씁니다.
    const fromRoster = getEnrollmentStatus(roster, user?.userId);
    if (fromRoster) return fromRoster;
    if (enrollResult === "ENROLLED" || enrollResult === "WAITING")
      return enrollResult;
    return null;
  }, [roster, enrollResult, user]);

  if (isLoading) return <Spinner />;

  if (!lecture) {
    return (
      /* 헤더(68px)와 PageShell 상하 여백(32/96px)을 뺀 높이 안에서 가운데를 잡으면
         화면 기준으로도 가운데에 옵니다. 공지 배너가 떠 있을 때 스크롤이 생기지
         않도록 여유분을 조금 더 뺐습니다. */
      <PageShell className="flex min-h-[calc(100dvh-260px)] flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          이번 주엔 열린 강연이 없습니다
        </h1>
        {/* 제목과 설명은 한 덩어리로 읽혀야 해서 붙이고, 행동 유도만 떼어 놓습니다. */}
        <p className="mt-2.5 max-w-[52ch] text-sm leading-relaxed text-gray-600">
          학생이 직접 주제를 선정해 발표하는
          <br />
          자율 참여형 지식 공유 컨퍼런스를 개최해봐요!
        </p>
        <div className="mt-8">
          <CreateLectureButton />
        </div>
        {/* 이번 주가 비어 있어도 지난 강연은 남아 있으므로 목록으로 가는 길을 둡니다. */}
        <Link
          href="/lectures"
          className="focusable mt-4 rounded-lg text-sm font-medium text-gray-500 underline-offset-4 transition-colors hover:text-gray-900 hover:underline"
        >
          전체 강연 보기
        </Link>
      </PageShell>
    );
  }

  const displayStatus = getDisplayLectureStatus(lecture);
  const totalCapacity =
    lecture.totalCapacity ??
    (lecture.capacityByGrade?.["1"] ?? 0) +
      (lecture.capacityByGrade?.["2"] ?? 0) +
      (lecture.capacityByGrade?.["3"] ?? 0);
  const showsGradeCapacity = usesGradeCapacity(
    lecture.totalCapacity,
    lecture.capacityByGrade,
  );
  // 상세 화면과 같은 규칙으로 내 학년에 배정된 자리가 있는지 봅니다.
  const isGradeCapacityBlocked = checkGradeCapacityBlocked({
    totalCapacity: lecture.totalCapacity,
    capacityByGrade: lecture.capacityByGrade,
    studentNumber: user?.studentNumber,
  });
  // 인원수는 서버가 센 값을 그대로 씁니다. 대기자를 신청자로 세지 않도록.
  const enrolledCount = lecture.enrolledCount;
  const waitingCount = lecture.waitingCount;
  const seatsLeft = Math.max(totalCapacity - enrolledCount, 0);
  const isFull = enrolledCount >= totalCapacity;
  // 전체 정원이 아직 남았는데 내 학년 자리만 찬 경우입니다. 상세 화면과 같게
  // 신청을 막지 않고 대기로 받습니다.
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
  const isCreator = user?.userId === lecture.creatorId;
  const otherCount = lectures.length - 1;

  // 상세 페이지와 같은 규칙입니다. 신청은 수락된 날 16:20부터 받습니다.
  const enrollmentOpenAt = getLectureEnrollmentOpenAt(lecture);
  const isBeforeEnrollmentOpen =
    !hasEnrollmentOpened && isBeforeOpen(enrollmentOpenAt);
  // 마감이 지나면 서버가 신청을 거절합니다. 상태가 아직 CONFIRMED여도 버튼을 닫습니다.
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

  // 상세 페이지와 같은 규칙: 강연자·일정·장소를 라벨 없이 한 줄로 두고
  // 이름만 진하게 해서 시선이 먼저 걸리게 합니다.
  const scheduleText = [
    formatLectureDate(lecture.lectureDate),
    formatLectureTime(lecture.lectureTime),
  ]
    .filter(Boolean)
    .join(" ");
  const speakerText = lecture.creatorStudentNumber
    ? `${lecture.creatorStudentNumber} ${lecture.creatorName}`
    : lecture.creatorName;
  const metaParts = [
    { text: speakerText, strong: true },
    { text: scheduleText, strong: false },
    { text: lecture.lectureLocation ?? "", strong: false },
  ].filter((part) => Boolean(part.text));

  return (
    <PageShell size="narrow">
      <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-12">
        <Badge variant={LECTURE_STATUS_TO_BADGE[displayStatus]} />
        {(isCreator || isAdmin) && (
          <Link
            href={`/lectures/${lecture.lectureId}/edit`}
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

      {/* 누가 언제 어디서 하는지가 신청 여부를 가르는 경우가 많아 제목 바로 밑에 둡니다. */}
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

      <div className="mt-10 flex flex-wrap items-start gap-x-16 gap-y-8">
        {/* 게이지는 정원 이야기입니다. 마감 카운트다운 아래에 폭을 맞춰 깔면
            마감 진행률로 읽히기 때문에 자리 블록 안에만 둡니다. */}
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

        {/* 아직 신청이 안 열렸으면 마감이 아니라 시작까지를 셉니다. */}
        {isBeforeEnrollmentOpen && enrollmentOpenAt ? (
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
          lecture.applicationDeadline && (
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
        className="mt-2.5 h-2 rounded-full"
      />
      {/* 학년별로 자리를 나눈 강연은 총 정원만으로는 내가 낄 자리가 있는지
          알 수 없어서, 상세 화면과 같은 자리에 학년별 정원을 적어 둡니다. */}
      {showsGradeCapacity && (
        <p className="tnum mt-2 text-right text-xs text-gray-500">
          {(["1", "2", "3"] as const)
            .map((g) => `${g}학년 ${lecture.capacityByGrade![g] ?? 0}`)
            .join(" · ")}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-2">
        {isCreator ? (
          <Button variant="waiting" disabled className="w-full py-3">
            내가 개설한 강연입니다
          </Button>
        ) : isGradeCapacityBlocked ? (
          <Button variant="waiting" disabled className="w-full py-3">
            다른 학년만 신청할 수 있습니다
          </Button>
        ) : isBeforeEnrollmentOpen && enrollmentOpenAt ? (
          <Button variant="waiting" disabled className="w-full py-3">
            {formatEnrollmentOpenAt(enrollmentOpenAt)}부터 신청
          </Button>
        ) : enrollStatus ? (
          <>
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
                {isCancelling ? "취소하는 중" : "신청 취소"}
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
        )}

        {/* 남은 자리가 있는데 왜 대기로 가는지 버튼만으로는 알 수 없어서 적어 둡니다. */}
        {isMyGradeTaken && !enrollStatus && !isEnrollmentClosed && (
          <p className="text-center text-xs text-gray-500">
            {myGrade}학년 자리가 모두 차서 대기자로 등록됩니다.
          </p>
        )}
        {enrollResult === "ERROR" && (
          <p className="text-center text-sm text-error">
            신청하지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        )}
        {deadlineText && (
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
        {/* 학생회는 이번 주 강연 화면에서 바로 출석을 찍고 명단을 복사합니다. */}
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

      {otherCount > 0 && (
        <Link
          href="/lectures"
          className="focusable lift mt-16 flex items-center justify-between gap-4 rounded-2xl bg-surface px-6 py-5 shadow-e2 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-e3"
        >
          <span className="flex flex-col gap-1">
            <span className="text-sm font-bold text-gray-900">
              전체 강연 보기
            </span>
            <span className="tnum text-xs text-gray-500">
              지난 강연까지 {otherCount}개가 더 있습니다
            </span>
          </span>
          <span className="shrink-0 rotate-180 text-gray-400">
            <Arrow />
          </span>
        </Link>
      )}
    </PageShell>
  );
}
