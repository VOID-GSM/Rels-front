import { formatLectureDate } from "./formatLectureSchedule";
import { parseServerDateTime } from "./serverDateTime";

/** 7교시가 끝나는 시각. 강연 신청은 이 시각부터 받습니다. */
const OPEN_HOUR = 16;
const OPEN_MINUTE = 20;

const pad = (value: number) => String(value).padStart(2, "0");

/** "16:20" — 화면 문구에서 신청 시작 시각을 가리킬 때 씁니다. */
export const ENROLLMENT_OPEN_TIME = `${pad(OPEN_HOUR)}:${pad(OPEN_MINUTE)}`;

/**
 * 신청이 열리는 시각입니다.
 *
 * 백엔드에 신청 시작 필드가 없어서 개설 시각으로 계산합니다. 개설한 날 16:20이
 * 기본이고, 개설한 시점이 이미 그 시각을 넘겼으면 다음 날 16:20입니다.
 * 백엔드가 신청 시작 시각을 내려주기 시작하면 이 계산 대신 그 값을 쓰면 됩니다.
 */
export const getEnrollmentOpenAt = (createdAt?: string | null): Date | null => {
  // createdAt은 UTC로 오므로 그대로 읽으면 하루가 밀립니다.
  const created = parseServerDateTime(createdAt);
  if (!created) return null;

  const openAt = new Date(
    created.getFullYear(),
    created.getMonth(),
    created.getDate(),
    OPEN_HOUR,
    OPEN_MINUTE,
    0,
    0,
  );

  if (created.getTime() >= openAt.getTime()) {
    openAt.setDate(openAt.getDate() + 1);
  }

  return openAt;
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

/** "8월 27일 (목) 16:20" */
export const formatEnrollmentOpenAt = (openAt: Date): string => {
  const date = `${openAt.getFullYear()}-${pad(openAt.getMonth() + 1)}-${pad(
    openAt.getDate(),
  )}`;

  return `${formatLectureDate(date)} ${pad(openAt.getHours())}:${pad(
    openAt.getMinutes(),
  )}`;
};
