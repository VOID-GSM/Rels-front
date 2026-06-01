export const LECTURE_TITLE_MAX_LENGTH = 100;
export const LECTURE_DESCRIPTION_MAX_LENGTH = 800;
export const LECTURE_MIN_CAPACITY = 10;
export const LECTURE_MAX_CAPACITY = 30;

export const LECTURE_STATUS_LABEL = {
  OPEN: "개설 미정",
  CONFIRMED: "개설 확정",
  CLOSED: "강연 종료",
  UNCONFIRMED: "개설 불확정",
} as const;

export const ENROLLMENT_STATUS_LABEL = {
  ENROLLED: "신청 완료",
  WAITING: "대기 중",
} as const;

export const LECTURE_STATUS_TO_BADGE = {
  OPEN: "open",
  CONFIRMED: "confirmed",
  CLOSED: "closed",
  UNCONFIRMED: "unconfirmed",
} as const;

export const LECTURE_STATUS_SORT_ORDER = {
  CONFIRMED: 0,
  OPEN: 1,
  UNCONFIRMED: 2,
  CLOSED: 3,
} as const;
