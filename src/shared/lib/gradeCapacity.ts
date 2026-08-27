/** 학년별 정원을 다루는 규칙을 한곳에 모읍니다. 홈과 상세가 같은 판단을 하도록. */

export type GradeKey = "1" | "2" | "3";

export const GRADE_KEYS = ["1", "2", "3"] as const;

type GradeCapacityMap = Partial<Record<GradeKey, number>> | null | undefined;

/** 학번 "2204" → "2". 백엔드가 숫자로 내려줘도 읽히도록 문자열로 맞춥니다. */
export const getUserGrade = (
  studentNumber?: string | number | null,
): GradeKey | undefined => {
  const first = String(studentNumber ?? "").charAt(0);

  return first === "1" || first === "2" || first === "3" ? first : undefined;
};

/**
 * 학년별로 자리를 나눈 강연인지.
 * 총 정원으로 만든 강연은 capacityByGrade가 비어 옵니다.
 */
export const usesGradeCapacity = (
  totalCapacity: number | null | undefined,
  capacityByGrade: GradeCapacityMap,
): boolean => totalCapacity == null && capacityByGrade != null;

interface GradeCapacityBlockParams {
  totalCapacity: number | null | undefined;
  capacityByGrade: GradeCapacityMap;
  studentNumber?: string | number | null;
}

/**
 * 내 학년에는 애초에 자리를 배정하지 않은 강연인지.
 *
 * 자리가 배정돼 있는데 같은 학년이 다 채운 경우는 여기서 막지 않습니다.
 * 그때는 그 학년 대기로 신청할 수 있습니다.
 */
export const isGradeCapacityBlocked = ({
  totalCapacity,
  capacityByGrade,
  studentNumber,
}: GradeCapacityBlockParams): boolean => {
  const grade = getUserGrade(studentNumber);

  if (!usesGradeCapacity(totalCapacity, capacityByGrade) || !grade) {
    return false;
  }

  return (capacityByGrade?.[grade] ?? 0) === 0;
};
