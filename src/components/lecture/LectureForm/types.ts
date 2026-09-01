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
  /** 신청 마감일은 보내지 않습니다. 서버가 강연 날짜에서 계산합니다. */
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
};
