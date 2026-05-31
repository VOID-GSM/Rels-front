export type LectureStatusType =
  | "OPEN"
  | "CONFIRMED"
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

export interface MyEnrolledLecture {
  lectureId: number;
  title: string;
  lectureStatus: LectureStatusType;
  enrollmentStatus: "ENROLLED" | "WAITING" | string;
  creatorName: string;
  creatorStudentNumber?: string;
  lectureLocation: string | null;
  lectureDate: string | null;
  lectureTime: string | null;
  applicationDeadline: string | null;
  requestedAt: string;
}

export interface MyCreatedLecture {
  lectureId: number;
  title: string;
  lectureStatus: LectureStatusType;
  lectureLocation: string | null;
  lectureDate: string | null;
  lectureTime: string | null;
  applicationDeadline: string | null;
  createdAt: string;
}

export interface MyLectureEnrollmentsType {
  enrolledLectures: MyEnrolledLecture[];
  createdLectures: MyCreatedLecture[];
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
  creatorStudentNumber?: string;
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
