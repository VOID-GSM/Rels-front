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

/**
 * 강연의 신청이 열리는 시각입니다.
 *
 * 기준은 개설 시각이 아니라 학생회가 수락한 시각입니다. 개설 시각으로 세면 어제
 * 만들어 둔 강연이 오늘 수락되는 순간 이미 16:20을 지나 있어서 곧바로 신청이
 * 열려 버립니다. 수락된 당일 16:20부터 받아야 하니 approvedAt으로 셉니다.
 *
 * approvedAt이 없는 응답(수락 전이거나 필드가 추가되기 전에 쌓인 강연)은 예전처럼
 * 개설 시각으로 셉니다.
 */
export const getLectureEnrollmentOpenAt = (lecture: {
  approvedAt?: string | null;
  createdAt?: string | null;
}): Date | null =>
  getEnrollmentOpenAt(lecture.approvedAt ?? lecture.createdAt);

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

/** "8월 27일 (목) 16:20" */
export const formatEnrollmentOpenAt = (openAt: Date): string => {
  const date = `${openAt.getFullYear()}-${pad(openAt.getMonth() + 1)}-${pad(
    openAt.getDate(),
  )}`;

  return `${formatLectureDate(date)} ${pad(openAt.getHours())}:${pad(
    openAt.getMinutes(),
  )}`;
};
