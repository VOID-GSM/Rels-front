export type LectureStatusType =
  | "OPEN"
  | "CONFIRMED"
  | "FAILED"
  | "CLOSED"
  | "UNCONFIRMED";

export interface EnrollmentApplicant {
  userId: number;
  name: string;
  studentNumber: string;
  requestedAt: string;
}

export interface LectureEnrollmentsType {
  lectureId: number;
  enrolled: EnrollmentApplicant[];
  waiting: EnrollmentApplicant[];
}

export interface GradeCapacities {
  "1": number;
  "2": number;
  "3": number;
}

export interface LectureType {
  lectureId: number;
  title: string;
  description: string;
  creatorId: number;
  creatorName: string;
  lectureStatus: LectureStatusType;
  capacityByGrade?: GradeCapacities;
  totalCapacity?: number | null;
  enrolledCount: number;
  waitingCount: number;
  lectureLocation: string | null;
  lectureDate: string | null;
  lectureTime: string | null;
  applicationDeadline?: string | null;
  createdAt: string;
}
