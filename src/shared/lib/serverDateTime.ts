/**
 * 백엔드가 직접 찍는 시각(createdAt)은 UTC인데 오프셋 없이 내려옵니다.
 * `2026-08-25T19:16:44.219557`처럼 오는데, 이건 한국 시간으로 8월 26일 04:16입니다.
 * new Date()에 그대로 넣으면 오프셋이 없어 로컬 시간으로 읽혀 9시간이 밀립니다.
 *
 * 오프셋이 붙어 오면 그대로 읽고, 없으면 UTC로 읽습니다. 백엔드가 오프셋을
 * 붙여 주기 시작해도 이 함수는 그대로 동작합니다.
 *
 * 사용자가 입력한 시각(applicationDeadline, lectureDate, lectureTime)은 반대로
 * 로컬 시간 그대로 저장되니 이 함수를 쓰면 안 됩니다.
 */
export const parseServerDateTime = (value?: string | null): Date | null => {
  if (!value) return null;

  const trimmed = value.trim();
  const hasTimeZone = /(Z|[+-]\d{2}:?\d{2})$/.test(trimmed);
  const date = new Date(hasTimeZone ? trimmed : `${trimmed}Z`);

  return Number.isNaN(date.getTime()) ? null : date;
};

/** 서버가 찍은 시각을 "2026년 8월 26일"로 보여 줍니다. */
export const formatServerDate = (value?: string | null): string => {
  const date = parseServerDateTime(value);
  if (!date) return "";

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
