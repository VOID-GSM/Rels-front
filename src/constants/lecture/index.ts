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

export const LECTURE_APPROVAL_LABEL = {
  PENDING: "보류",
  APPROVED: "수락",
  REJECTED: "거절",
} as const;

/**
 * 개설자에게 보여 주는 승인 상태 문구입니다.
 * 학생회가 누르는 버튼(LECTURE_APPROVAL_LABEL)과 달리, 개설자 입장에서는
 * "아직 안 올라갔다"는 결과보다 "학생회가 보고 있다"는 진행 상황이 필요합니다.
 */
export const LECTURE_APPROVAL_NOTICE = {
  PENDING: "학생회가 확인 중",
  REJECTED: "개설 거절됨",
} as const;

export const ATTENDANCE_STATUS_LABEL = {
  NONE: "미확인",
  ATTENDED: "출석",
  ABSENT: "결석",
  LATE: "지각",
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
