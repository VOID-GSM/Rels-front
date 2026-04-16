export type LectureStatusType = "OPEN" | "CONFIRMED" | "FAILED" | "CLOSED";

export interface EnrollmentApplicant {
  userId: number;
  name: string;
  studentNumber: string;
  requestedAt: string;
}

export interface LectureEnrollmentsType {
  lectureId: number;
  enrolledApplicants: EnrollmentApplicant[];
  waitingApplicants: EnrollmentApplicant[];
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
  gradeCapacities: GradeCapacities;
  enrolledCount: number;
  waitingCount: number;
  lectureLocation: string | null;
  lectureDate: string | null;
  lectureTime: string | null;
  createdAt: string;
}
