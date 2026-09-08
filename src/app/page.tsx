"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Arrow from "@/assets/svg/Arrow";
import Pencil from "@/assets/svg/Pencil";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import MarkdownContent from "@/components/common/MarkdownContent";
import { toast } from "sonner";
import SeatMeter from "@/components/lecture/SeatMeter";
import DeadlineCountdown from "@/components/lecture/DeadlineCountdown";
import LectureSwitcher from "@/components/lecture/LectureSwitcher";
import PageShell from "@/components/layout/PageShell";
import CreateLectureButton from "@/components/lecture/CreateLectureButton";
import useAuthStore from "@/stores/authStore";
import {
  getDisplayLectureStatus,
  useGetLectures,
  useEnrollLecture,
  useCancelEnrollment,
  useGetEnrollments,
  useDecideEnrollment,
  useGetAttendances,
  useUpdateAttendances,
} from "@/entities/lecture";
import type { EnrollmentStatusType, LectureType } from "@/entities/lecture";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { formatSpeakers } from "@/shared/lib/formatSpeakers";
import { LECTURE_STATUS_TO_BADGE } from "@/constants/lecture";
import {
  formatLectureDate,
  formatLectureTime,
} from "@/shared/lib/formatLectureSchedule";
import {
  getLectureEnrollmentOpenAt,
  formatEnrollmentOpenAt,
  isBeforeEnrollmentOpen as checkBeforeEnrollmentOpen,
  isAfterDeadline,
} from "@/shared/lib/enrollmentWindow";
import {
  getUserGrade,
  hasNoGradeSeat as checkNoGradeSeat,
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
 * 이번 주에 결정할 강연들을 보여 줄 순서대로 골라 냅니다.
 * 아직 신청을 받는 강연이 앞에 서고, 열려는 있지만 마감만 지난 강연이 뒤에 붙습니다.
 * 각 묶음 안에서는 마감이 가까운 순입니다.
 * 첫 번째가 스포트라이트에 서고 나머지는 전환 칩으로 남습니다. 예전에는 마감 전
 * 강연이 하나라도 있으면 나머지를 버렸지만, 같은 주에 강연이 여러 개 열리면
 * 버려진 쪽이 첫 화면에서 아예 사라지기 때문에 뒤로 붙여만 둡니다.
 */
function getLiveLectures(lectures: LectureType[]) {
  const live = lectures.filter((l) => {
    // 승인 전이거나 거절된 강연이 목록에 섞여 오면(개설자·학생회 시점) 첫 화면
    // 전체를 차지해 버립니다. 이번 주 강연은 공개된 것 중에서만 고릅니다.
    if (l.approvalStatus === "PENDING" || l.approvalStatus === "REJECTED")
      return false;

    const status = getDisplayLectureStatus(l);
    return status === "OPEN" || status === "CONFIRMED";
  });

  // 날짜가 비어 있거나("" 는 ?? 가 거르지 못합니다) 깨져 오면 getTime()이 NaN이라
  // 비교가 전부 false가 됩니다. 그대로 두면 어느 묶음에도 못 들어가 목록에서
  // 통째로 빠지고, 그 강연 하나뿐이면 첫 화면이 비어 버립니다.
  const key = (l: LectureType) => {
    const time = new Date(
      l.applicationDeadline ?? l.lectureDate ?? "9999-12-31",
    ).getTime();
    return Number.isNaN(time) ? Infinity : time;
  };
  // Infinity끼리 빼면 NaN이라 정렬이 흔들립니다. 크기만 비교합니다.
  const byDeadline = (a: LectureType, b: LectureType) => {
    const [ka, kb] = [key(a), key(b)];
    if (ka === kb) return 0;
    return ka < kb ? -1 : 1;
  };

  const now = Date.now();
  // 마감을 알 수 없는 강연은 마감 전으로 치지 않습니다. 스포트라이트는 마감이
  // 분명한 강연에 양보하고 맨 뒤에 세웁니다.
  const isStillTaking = (l: LectureType) => {
    const time = key(l);
    return Number.isFinite(time) && time > now;
  };
  const stillTakingApplications = live.filter(isStillTaking).sort(byDeadline);
  const alreadyClosed = live.filter((l) => !isStillTaking(l)).sort(byDeadline);

  return [...stillTakingApplications, ...alreadyClosed];
}

export default function ThisWeekPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const { data: lectures = [], isLoading } = useGetLectures();

  const liveLectures = useMemo(() => getLiveLectures(lectures), [lectures]);
  // 고른 강연은 id로만 들고, 실제로 세울 강연은 매 렌더 목록에서 다시 찾습니다.
  // 이렇게 두면 refetch로 고른 강연이 목록에서 빠져도 useEffect로 상태를
  // 되돌릴 필요 없이 저절로 첫 번째 강연으로 돌아옵니다.
  const [selectedLectureId, setSelectedLectureId] = useState<number | null>(
    null,
  );
  const lecture =
    liveLectures.find((l) => l.lectureId === selectedLectureId) ??
    liveLectures[0] ??
    null;
  const lectureId = lecture?.lectureId ?? 0;

  const { data: enrollments, isLoading: isLoadingEnrollments } =
    useGetEnrollments(lectureId);

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
    EnrollmentStatusType | "ERROR" | null
  >(null);

  // 지금 처리 중인 대기자. 그 줄의 버튼만 잠가서 명단 전체가 멈추지 않게 합니다.
  const [decidingUserId, setDecidingUserId] = useState<number | null>(null);
  const { mutate: decideEnrollment } = useDecideEnrollment(lectureId, {
    onSuccess: (_, variables) => {
      setDecidingUserId(null);
      toast.success(
        variables.approved
          ? "대기자를 수락했습니다."
          : "대기 신청을 거절했습니다.",
      );
    },
    onError: (error) => {
      setDecidingUserId(null);
      toast.error(
        getApiErrorMessage(error, {
          preferServerMessage: true,
          statusMessages: {
            400: "이미 처리된 신청입니다.",
            403: "개설자와 학생회만 처리할 수 있습니다.",
          },
        }),
      );
    },
  });

  const handleDecide = (userId: number, approved: boolean) => {
    setDecidingUserId(userId);
    decideEnrollment({ userId, approved });
  };

  const handleSelectLecture = (id: number) => {
    setSelectedLectureId(id);
    // 앞 강연에서 켜진 마감 지남·신청 열림·신청 실패 상태가 그대로 남으면
    // 다음 강연 버튼이 그 강연과 무관한 문구와 잠금으로 뜹니다.
    setHasEnrollmentOpened(false);
    setHasDeadlinePassed(false);
    setEnrollResult(null);
    setDecidingUserId(null);
  };

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

  const enrollStatus = useMemo<EnrollmentStatusType | null>(() => {
    // 상세 페이지와 같은 우선순위입니다. 서버가 내려준 내 신청 상태가 먼저고,
    // 그다음이 명단, 마지막이 방금 누른 결과입니다. 목록 응답에 내 상태가 없으면
    // (optional) 예전처럼 명단이 곧 진실입니다.
    const mine = lecture?.myEnrollmentStatus;
    if (mine) return mine;

    // 거절된 신청은 명단에 없습니다. 명단으로는 ENROLLED/WAITING만 알 수 있습니다.
    const fromRoster = getEnrollmentStatus(roster, user?.userId);
    if (fromRoster) return fromRoster;
    if (enrollResult && enrollResult !== "ERROR") return enrollResult;
    return null;
  }, [lecture, roster, enrollResult, user]);

  // 강연을 바꾸면 명단을 새로 받아야 내 신청 여부를 알 수 있습니다. 그 사이에
  // "신청하기"를 열어 두면 이미 신청한 강연인데도 버튼이 잠깐 떠서 중복 신청을
  // 누르게 됩니다. 서버가 내 상태를 함께 내려준 강연은 기다릴 필요가 없습니다.
  const isEnrollStatusPending =
    isLoadingEnrollments && !lecture?.myEnrollmentStatus;

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
  // 상세 화면과 같은 규칙입니다. 자리가 없어도 막지 않고 대기로 받습니다.
  const hasNoGradeSeat = checkNoGradeSeat({
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
  const isWaitlistOnly = isFull || isMyGradeTaken || hasNoGradeSeat;
  const myGrade = getUserGrade(user?.studentNumber);
  const isCreator = user?.userId === lecture.creatorId;
  // 연사자는 자기 강연에 신청할 수 없습니다. 서버도 403으로 막습니다.
  const isSpeaker =
    lecture.speakers?.some((speaker) => speaker.userId === user?.userId) ??
    false;
  // 상세 화면과 같습니다. 수락·거절은 학생회만 할 수 있습니다.
  const canDecide = isAdmin;
  // 칩으로 이미 꺼내 놓은 강연은 "더 있습니다"에서 빼야 합니다. 안 그러면
  // 바로 위에서 고를 수 있는 강연이 아래에서 또 세어집니다.
  const otherCount = lectures.length - liveLectures.length;
  // 전환 줄이 뜨는 화면에서는 그 줄이 상단 여백을 대신 맡습니다.
  const hasMultipleLive = liveLectures.length > 1;
  // 제목만 있으면 그냥 버튼으로 읽혀서, 목록 카드와 같은 정보(상태·제목·강연자·날짜)를
  // 담아 넘깁니다. 강연자도 날짜도 비어 있으면 빈 문자열이라 그 줄은 그려지지 않습니다.
  const switcherItems = liveLectures.map((l) => ({
    id: l.lectureId,
    title: l.title,
    status: LECTURE_STATUS_TO_BADGE[getDisplayLectureStatus(l)],
    meta: [formatSpeakers(l), formatLectureDate(l.lectureDate)]
      .filter(Boolean)
      .join(" · "),
  }));

  // 상세 페이지와 같은 규칙입니다. 신청은 개설한 날이 아니라 학생회가 수락한 날
  // 16:20부터 받습니다.
  const enrollmentOpenAt = getLectureEnrollmentOpenAt(lecture);
  // 마감이 지나도 신청은 막히지 않고 대기로만 들어갑니다. 문구만 바꿉니다.
  const isAfterEnrollmentDeadline =
    hasDeadlinePassed || isAfterDeadline(lecture.applicationDeadline);
  // 마감됐거나 이미 신청자가 있으면 신청 시작 시각 계산이 틀린 것이므로 믿지 않습니다.
  const isBeforeEnrollmentOpen =
    !hasEnrollmentOpened &&
    checkBeforeEnrollmentOpen({
      openAt: enrollmentOpenAt,
      isClosed: isAfterEnrollmentDeadline,
      hasEnrollments: enrolledCount + waitingCount > 0,
    });

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
  const speakerText = formatSpeakers(lecture);
  const metaParts = [
    { text: speakerText, strong: true },
    { text: scheduleText, strong: false },
    { text: lecture.lectureLocation ?? "", strong: false },
  ].filter((part) => Boolean(part.text));

  return (
    <PageShell size="narrow">
      {/* 같은 주에 강연이 여러 개 열리면 하나만 보여 주고 나머지를 감출 수 없어서,
          스포트라이트 위에 전환 줄을 답니다. 열린 강연이 하나면 스스로 사라집니다. */}
      <LectureSwitcher
        items={switcherItems}
        selectedId={lecture.lectureId}
        onSelect={handleSelectLecture}
        className="mt-6 md:mt-12"
      />

      <div
        className={`flex flex-wrap items-center gap-4 ${
          hasMultipleLive ? "mt-4" : "mt-6 md:mt-12"
        }`}
      >
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
        {isCreator || isSpeaker ? (
          <Button variant="waiting" disabled className="w-full py-3">
            {isCreator ? "내가 개설한 강연입니다" : "내가 진행하는 강연입니다"}
          </Button>
        ) : displayStatus === "CLOSED" ? (
          // 화면을 열어 둔 채 강연 시각을 넘기면 고른 강연은 그대로 남습니다.
          // 서버는 종료된 강연의 신청을 받지 않으므로 여기서도 닫습니다.
          <Button variant="waiting" disabled className="w-full py-3">
            강연 종료
          </Button>
        ) : isBeforeEnrollmentOpen && enrollmentOpenAt ? (
          <Button variant="waiting" disabled className="w-full py-3">
            {formatEnrollmentOpenAt(enrollmentOpenAt)}부터 신청
          </Button>
        ) : enrollStatus === "REJECTED" ? (
          // 거절된 신청은 되돌릴 수 없습니다. 다시 신청해도 서버가 막습니다.
          <Button variant="waiting" disabled className="w-full py-3">
            신청이 거절되었습니다
          </Button>
        ) : enrollStatus ? (
          <>
            <p className="rounded-xl bg-main-soft py-2.5 text-center text-sm font-bold text-gray-900">
              {enrollStatus === "ENROLLED" ? "신청했습니다" : "대기 중입니다"}
            </p>
            {/* 마감 뒤에는 확정된 명단이 흔들리면 안 되므로 신청 취소만 막습니다.
              아직 확정되지 않은 대기는 마감 뒤에도 스스로 뺄 수 있어야 합니다. */}
            {enrollStatus === "ENROLLED" && isAfterEnrollmentDeadline ? (
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
            {enrollStatus === "WAITING" && (
              <p className="text-center text-xs text-gray-500">
                학생회가 수락하면 신청이 확정됩니다.
              </p>
            )}
          </>
        ) : (
          <Button
            onClick={() => enrollLecture()}
            disabled={isEnrolling || isEnrollStatusPending}
            className="w-full py-3 text-base"
          >
            {isEnrollStatusPending
              ? "불러오는 중"
              : isEnrolling
                ? "신청하는 중"
                : isWaitlistOnly || isAfterEnrollmentDeadline
                  ? "대기로 신청하기"
                  : "신청하기"}
          </Button>
        )}

        {/* 남은 자리가 있는데 왜 대기로 가는지 버튼만으로는 알 수 없어서 적어 둡니다. */}
        {!enrollStatus && isAfterEnrollmentDeadline ? (
          <p className="text-center text-xs text-gray-500">
            마감 뒤 신청은 대기자로 등록되고, 학생회가 수락해야 확정됩니다.
          </p>
        ) : !enrollStatus && hasNoGradeSeat ? (
          <p className="text-center text-xs text-gray-500">
            {myGrade}학년에 배정된 자리가 없어 대기자로 등록됩니다.
          </p>
        ) : (
          isMyGradeTaken &&
          !enrollStatus && (
            <p className="text-center text-xs text-gray-500">
              {myGrade}학년 자리가 모두 차서 대기자로 등록됩니다.
            </p>
          )
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
        <MarkdownContent className="mt-5" size="base">
          {lecture.description}
        </MarkdownContent>
      </section>

      {/* 칩으로 강연을 바꿔도 같은 자리의 같은 컴포넌트라 React가 재조정만 해서,
          저장하지 않은 출석 체크가 다음 강연 명단에 그대로 옮겨 붙습니다.
          강연 id를 key로 걸어 강연이 바뀌면 명단을 통째로 새로 마운트합니다. */}
      <div key={lecture.lectureId} className="mt-16 grid gap-4 sm:grid-cols-2">
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
          // 대기자를 신청자로 올릴지는 개설자와 학생회가 정합니다.
          onDecide={canDecide ? handleDecide : undefined}
          decidingUserId={decidingUserId}
        />
        {/* 거절 명단은 서버가 개설자·학생회에게만 내려줍니다. */}
        {roster.rejected.length > 0 && (
          <ApplicantList type="rejected" applicants={roster.rejected} />
        )}
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
