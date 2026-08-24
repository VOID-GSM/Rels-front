const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * "2026-08-29" → "8월 29일 (토)"
 * 문자열을 직접 쪼개서 로컬 자정으로 만듭니다. new Date("2026-08-29")는 UTC로
 * 해석돼서 시간대에 따라 하루가 밀립니다.
 */
export function formatLectureDate(date?: string | null) {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;

  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

/** "16:30:00" → "16:30" */
export function formatLectureTime(time?: string | null) {
  if (!time) return "";

  const [hour, minute] = time.split(":");
  if (hour === undefined || minute === undefined) return time;

  return `${hour}:${minute}`;
}
