import {
  getUserGrade,
  usesGradeCapacity,
  type GradeKey,
} from "./gradeCapacity";
import { parseServerDateTime } from "./serverDateTime";

/**
 * 신청자·대기자 자리를 프론트에서 직접 배분합니다.
 *
 * 서버가 준 ENROLLED/WAITING 구분을 그대로 쓰지 않고, 신청한 순서와 학년별
 * 정원만 보고 다시 세웁니다. 그래서 신청자가 취소해 자리가 비면 그 학년
 * 대기자 중 가장 먼저 신청한 사람이 곧바로 신청자 자리로 올라옵니다.
 */

interface Applicant {
  userId: number;
  studentNumber: string;
  requestedAt: string;
}

type GradeCapacityMap = Partial<Record<GradeKey, number>> | null | undefined;

/**
 * 신청 시각 오름차순. 시각이 비어 오면 순서를 흔들지 않고 받은 순서를 지킵니다.
 * (Array.prototype.sort는 안정 정렬이라 0을 돌려주면 원래 순서가 유지됩니다.)
 */
const byRequestedAt = (a: Applicant, b: Applicant): number => {
  const aTime = parseServerDateTime(a.requestedAt)?.getTime();
  const bTime = parseServerDateTime(b.requestedAt)?.getTime();

  if (aTime == null || bTime == null) return 0;

  return aTime - bTime;
};

interface AllocateParams<T extends Applicant> {
  /** 서버가 신청자로 분류한 사람들. */
  enrolled: T[] | undefined;
  /** 서버가 대기자로 분류한 사람들. */
  waiting: T[] | undefined;
  totalCapacity: number | null | undefined;
  capacityByGrade: GradeCapacityMap;
}

export interface Allocation<T extends Applicant> {
  enrolled: T[];
  waiting: T[];
}

export const allocateEnrollments = <T extends Applicant>({
  enrolled,
  waiting,
  totalCapacity,
  capacityByGrade,
}: AllocateParams<T>): Allocation<T> => {
  const server = { enrolled: enrolled ?? [], waiting: waiting ?? [] };

  // 신청자를 앞에 두고 이어 붙입니다. 신청 시각이 없을 때의 순서 기준이 됩니다.
  const all = [...server.enrolled, ...server.waiting].sort(byRequestedAt);

  if (usesGradeCapacity(totalCapacity, capacityByGrade)) {
    const seatsLeft: Record<GradeKey, number> = {
      "1": capacityByGrade?.["1"] ?? 0,
      "2": capacityByGrade?.["2"] ?? 0,
      "3": capacityByGrade?.["3"] ?? 0,
    };
    const next: Allocation<T> = { enrolled: [], waiting: [] };

    for (const applicant of all) {
      const grade = getUserGrade(applicant.studentNumber);

      // 학번을 못 읽는 사람은 자리를 차지시키지 않고 대기로 둡니다.
      if (grade && seatsLeft[grade] > 0) {
        seatsLeft[grade] -= 1;
        next.enrolled.push(applicant);
      } else {
        next.waiting.push(applicant);
      }
    }

    return next;
  }

  // 총 정원을 모르면 서버 판단을 건드리지 않습니다.
  if (totalCapacity == null) return server;

  return {
    enrolled: all.slice(0, totalCapacity),
    waiting: all.slice(totalCapacity),
  };
};

export const getEnrollmentStatus = <T extends Applicant>(
  allocation: Allocation<T>,
  userId?: number,
): "ENROLLED" | "WAITING" | null => {
  if (userId == null) return null;
  if (allocation.enrolled.some((a) => a.userId === userId)) return "ENROLLED";
  if (allocation.waiting.some((a) => a.userId === userId)) return "WAITING";

  return null;
};

/**
 * 출석부처럼 신청 시각이 없는 목록을 배분 순서(=신청 순서)에 맞춰 세웁니다.
 * 명단에 없는 사람은 순서를 알 수 없어 맨 뒤로 보냅니다.
 */
export const orderByAllocation = <
  T extends Applicant,
  R extends { userId: number },
>(
  rows: R[],
  allocation: Allocation<T>,
): R[] => {
  const order = new Map<number, number>();

  [...allocation.enrolled, ...allocation.waiting].forEach(
    (applicant, index) => {
      order.set(applicant.userId, index);
    },
  );

  const rank = (row: R) => order.get(row.userId) ?? Number.MAX_SAFE_INTEGER;

  return [...rows].sort((a, b) => rank(a) - rank(b));
};

interface MyGradeFullParams<T extends Applicant> {
  allocation: Allocation<T>;
  totalCapacity: number | null | undefined;
  capacityByGrade: GradeCapacityMap;
  studentNumber?: string | number | null;
}

/** 내 학년 자리가 이미 다 찼는지. 배정이 0인 강연은 여기서 걸러지지 않습니다. */
export const isMyGradeFull = <T extends Applicant>({
  allocation,
  totalCapacity,
  capacityByGrade,
  studentNumber,
}: MyGradeFullParams<T>): boolean => {
  const grade = getUserGrade(studentNumber);

  if (!usesGradeCapacity(totalCapacity, capacityByGrade) || !grade)
    return false;

  const capacity = capacityByGrade?.[grade] ?? 0;
  if (capacity === 0) return false;

  const taken = allocation.enrolled.filter(
    (a) => getUserGrade(a.studentNumber) === grade,
  ).length;

  return taken >= capacity;
};
