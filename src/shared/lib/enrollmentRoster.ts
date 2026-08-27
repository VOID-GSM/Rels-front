import { getUserGrade, usesGradeCapacity } from "./gradeCapacity";

/**
 * 신청자·대기자 명단은 서버 분류를 그대로 씁니다.
 *
 * 예전에는 신청 순서와 학년 정원으로 프론트에서 다시 배분했는데, 그러면 서버가
 * 대기로 잡은 사람이 화면에서는 신청자로 올라와 인원수가 어긋나고 대기자 칸이
 * 비어 보였습니다. 승격은 서버가 처리하므로 여기서는 세는 일만 합니다.
 */

interface Applicant {
  userId: number;
  studentNumber: string;
}

type GradeCapacityMap =
  | Partial<Record<"1" | "2" | "3", number>>
  | null
  | undefined;

export interface EnrollmentRoster<T> {
  enrolled: T[];
  waiting: T[];
}

/** 아직 명단을 못 받았을 때도 화면이 빈 배열로 돌아가도록 감싸 줍니다. */
export const toRoster = <T>(
  enrollments: { enrolled: T[]; waiting: T[] } | undefined,
): EnrollmentRoster<T> => ({
  enrolled: enrollments?.enrolled ?? [],
  waiting: enrollments?.waiting ?? [],
});

export const getEnrollmentStatus = <T extends { userId: number }>(
  roster: EnrollmentRoster<T>,
  userId?: number,
): "ENROLLED" | "WAITING" | null => {
  if (userId == null) return null;
  if (roster.enrolled.some((a) => a.userId === userId)) return "ENROLLED";
  if (roster.waiting.some((a) => a.userId === userId)) return "WAITING";

  return null;
};

/**
 * 출석부처럼 신청 시각이 없는 목록을 명단 순서(=신청 순서)에 맞춰 세웁니다.
 * 명단에 없는 사람은 순서를 알 수 없어 맨 뒤로 보냅니다.
 */
export const orderByRoster = <
  T extends { userId: number },
  R extends { userId: number },
>(
  rows: R[],
  roster: EnrollmentRoster<T>,
): R[] => {
  const order = new Map<number, number>();

  [...roster.enrolled, ...roster.waiting].forEach((applicant, index) => {
    order.set(applicant.userId, index);
  });

  const rank = (row: R) => order.get(row.userId) ?? Number.MAX_SAFE_INTEGER;

  return [...rows].sort((a, b) => rank(a) - rank(b));
};

interface MyGradeFullParams<T extends Applicant> {
  /** 서버가 신청자로 잡은 사람들. */
  enrolled: T[];
  totalCapacity: number | null | undefined;
  capacityByGrade: GradeCapacityMap;
  studentNumber?: string | number | null;
}

/** 내 학년 자리가 이미 다 찼는지. 배정이 0인 강연은 여기서 걸러지지 않습니다. */
export const isMyGradeFull = <T extends Applicant>({
  enrolled,
  totalCapacity,
  capacityByGrade,
  studentNumber,
}: MyGradeFullParams<T>): boolean => {
  const grade = getUserGrade(studentNumber);

  if (!usesGradeCapacity(totalCapacity, capacityByGrade) || !grade)
    return false;

  const capacity = capacityByGrade?.[grade] ?? 0;
  if (capacity === 0) return false;

  const taken = enrolled.filter(
    (a) => getUserGrade(a.studentNumber) === grade,
  ).length;

  return taken >= capacity;
};
