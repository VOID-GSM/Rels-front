export type LectureStatusType = "OPEN" | "CONFIRMED" | "CLOSED" | "UNCONFIRMED";

export interface EnrollmentApplicant {
  userId: number;
  name: string;
  studentNumber: string;
  requestedAt: string;
}

/** 학생회 승인 상태. 학생이 강연을 만들면 PENDING으로 시작합니다. */
export type LectureApprovalStatusType = "PENDING" | "APPROVED" | "REJECTED";

export interface LectureApprovalRequest {
  approvalStatus: LectureApprovalStatusType;
  /** 거절할 때만 씁니다. 비워 두면 사유 없이 거절됩니다. */
  rejectionReason?: string;
}

export type AttendanceStatusType = "NONE" | "ATTENDED" | "ABSENT" | "LATE";

/** 출석부 한 줄. attendedAt은 아직 확인 전이면 비어 있습니다. */
export interface LectureAttendance {
  userId: number;
  name: string;
  studentNumber: string;
  attendanceStatus: AttendanceStatusType;
  attendedAt: string | null;
}

export interface AttendanceUpdate {
  userId: number;
  attendanceStatus: AttendanceStatusType;
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
  /** 백엔드 응답에 아직 없습니다. 내려오기 시작하면 화면이 저절로 켜집니다. */
  approvalStatus?: LectureApprovalStatusType;
  /** 거절된 강연에만 옵니다. 이것도 아직 응답에 없습니다. */
  rejectionReason?: string;
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
  /** 백엔드 응답에 아직 없습니다. 내려오기 시작하면 화면이 저절로 켜집니다. */
  approvalStatus?: LectureApprovalStatusType;
  /** 거절된 강연에만 옵니다. 이것도 아직 응답에 없습니다. */
  rejectionReason?: string;
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
