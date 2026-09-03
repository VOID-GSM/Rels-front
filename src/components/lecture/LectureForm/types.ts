import type { UserSummary } from "@/entities/user";

export interface LectureFormValues {
  title: string;
  description: string;
  capacityMode: "total" | "grade";
  totalCapacity: string;
  grade1: string;
  grade2: string;
  grade3: string;
  lectureLocation: string;
  lectureDate: string;
  lectureTime: string;
  /** "YYYY-MM-DDTHH:mm". 사용자가 고른 로컬 시각 그대로입니다. */
  applicationDeadline: string;
  /** 개설자를 뺀, 함께 진행하는 사람들. */
  speakers: UserSummary[];
}

export interface LectureFormData {
  title: string;
  description: string;
  totalCapacity?: number | null;
  capacityByGrade?: { "1": number; "2": number; "3": number } | null;
  lectureLocation?: string | null;
  lectureDate?: string | null;
  lectureTime?: string | null;
  /** 서버가 계산해 주지 않습니다. 생성·수정 모두 이 값을 보내야 합니다. */
  applicationDeadline?: string | null;
  speakerIds?: number[];
}

export type FormErrors = {
  title?: string;
  description?: string;
  totalCapacity?: string;
  grade1?: string;
  grade2?: string;
  grade3?: string;
  lectureLocation?: string;
  lectureDate?: string;
  lectureTime?: string;
  applicationDeadline?: string;
};
