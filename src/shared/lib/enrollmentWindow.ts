import { formatLectureDate } from "./formatLectureSchedule";
import { parseServerDateTime } from "./serverDateTime";

/** 7교시가 끝나는 시각. 강연 신청은 이 시각부터 받습니다. */
const OPEN_HOUR = 16;
const OPEN_MINUTE = 20;

const pad = (value: number) => String(value).padStart(2, "0");

/** "16:20" — 화면 문구에서 신청 시작 시각을 가리킬 때 씁니다. */
export const ENROLLMENT_OPEN_TIME = `${pad(OPEN_HOUR)}:${pad(OPEN_MINUTE)}`;

/**
 * 기준 시각 다음에 오는 16:20입니다.
 *
 * 기준이 된 날의 16:20이 기본이고, 기준 시점이 이미 그 시각을 넘겼으면 다음 날
 * 16:20입니다.
 */
export const getEnrollmentOpenAt = (basisAt?: string | null): Date | null => {
  // 서버가 찍은 시각은 UTC로 오므로 그대로 읽으면 하루가 밀립니다.
  const basis = parseServerDateTime(basisAt);
  if (!basis) return null;

  const openAt = new Date(
    basis.getFullYear(),
    basis.getMonth(),
    basis.getDate(),
    OPEN_HOUR,
    OPEN_MINUTE,
    0,
    0,
  );

  if (basis.getTime() >= openAt.getTime()) {
    openAt.setDate(openAt.getDate() + 1);
  }

  return openAt;
};

/** 오늘 16:20. 수락 시각을 모르는 강연의 신청을 여기까지 잠가 둡니다. */
const getTodayOpenAt = (): Date => {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    OPEN_HOUR,
    OPEN_MINUTE,
    0,
    0,
  );
};

/**
 * 강연의 신청이 열리는 시각입니다.
 *
 * 기준은 개설 시각이 아니라 학생회가 수락한 시각입니다. 개설 시각으로 세면 어제
 * 만들어 둔 강연이 오늘 수락되는 순간 이미 16:20을 지나 있어서 곧바로 신청이
 * 열려 버립니다. 수락된 당일 16:20부터 받아야 하니 approvedAt으로 셉니다.
 *
 * approvedAt은 백엔드에 컬럼이 생기기 전에 수락된 강연에는 없습니다. 그런 강연을
 * 개설 시각으로 세면 계산된 시각이 이미 지나 있어서 아침부터 신청이 열려 버립니다.
 * 언제 수락됐는지 알 수 없으니 적어도 오늘 16:20까지는 잠가 둡니다.
 */
export const getLectureEnrollmentOpenAt = (lecture: {
  approvedAt?: string | null;
  createdAt?: string | null;
}): Date | null => {
  if (lecture.approvedAt) return getEnrollmentOpenAt(lecture.approvedAt);

  const todayOpenAt = getTodayOpenAt();
  const createdOpenAt = getEnrollmentOpenAt(lecture.createdAt);

  // 오늘 개설된 강연은 개설 시각 계산이 더 늦습니다(16:20 뒤 개설 → 내일 16:20).
  return createdOpenAt && createdOpenAt.getTime() > todayOpenAt.getTime()
    ? createdOpenAt
    : todayOpenAt;
};

/**
 * 신청 마감 시각이 지났는지.
 *
 * 마감이 지나도 강연 상태는 CONFIRMED로 남아 있을 수 있습니다(신청자가 10명을
 * 넘긴 경우). 상태만 보고 버튼을 열어 두면 서버가 "신청 마감일이 지났습니다"로
 * 막아 403이 납니다. 마감 시각은 사용자가 입력한 값이라 로컬 시간 그대로 읽습니다.
 */
export const isAfterDeadline = (
  applicationDeadline?: string | null,
): boolean => {
  if (!applicationDeadline) return false;

  const deadline = new Date(applicationDeadline);
  if (Number.isNaN(deadline.getTime())) return false;

  return Date.now() >= deadline.getTime();
};

/**
 * 지금이 신청 시작 전인지.
 * 시각 비교를 모듈 안에 두어야 렌더 중에 불러도 되는 함수가 됩니다.
 */
export const isBeforeOpen = (openAt: Date | null): boolean =>
  openAt != null && Date.now() < openAt.getTime();

/**
 * 신청 시작 안내를 띄워도 되는 상태인지.
 *
 * 신청 시작 시각은 수락 시각에서 계산한 값이고, 수락 시각이 없는 강연에서는 오늘
 * 16:20으로 잡아 둡니다. 그런데 그 강연이 이미 신청을 받아 자리가 찼거나 마감까지
 * 지났다면 계산이 틀린 것이 분명한데도, 화면은 매일 "오늘 16:20부터 신청"으로
 * 덮어 버립니다. 계산이 틀렸다는 증거가 있는 두 경우 — 이미 마감됐거나 신청한
 * 사람이 있는 경우 — 에는 안내를 접고 실제 상태를 보여 줍니다.
 */
export const isBeforeEnrollmentOpen = ({
  openAt,
  isClosed,
  hasEnrollments,
}: {
  openAt: Date | null;
  isClosed: boolean;
  hasEnrollments: boolean;
}): boolean => !isClosed && !hasEnrollments && isBeforeOpen(openAt);

/** "8월 27일 (목) 16:20" */
export const formatEnrollmentOpenAt = (openAt: Date): string => {
  const date = `${openAt.getFullYear()}-${pad(openAt.getMonth() + 1)}-${pad(
    openAt.getDate(),
  )}`;

  return `${formatLectureDate(date)} ${pad(openAt.getHours())}:${pad(
    openAt.getMinutes(),
  )}`;
};
