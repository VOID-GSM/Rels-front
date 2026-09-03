export type LectureStatusType = "OPEN" | "CONFIRMED" | "CLOSED" | "UNCONFIRMED";

/**
 * 내 신청 상태. 신청하지 않았으면 서버가 null로 내려줍니다.
 * REJECTED는 대기자였다가 개설자나 학생회가 거절한 경우입니다.
 */
export type EnrollmentStatusType = "ENROLLED" | "WAITING" | "REJECTED";

/** 함께 강연하는 사람들. 서버가 개설자까지 포함해서 내려줍니다. */
export interface LectureSpeaker {
  userId: number;
  name: string;
  studentNumber: string;
}

/** 대기자 한 명에 대한 수락/거절. */
export interface EnrollmentDecisionRequest {
  approved: boolean;
}

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
  /** 거절된 신청. 개설자와 학생회에게만 내려오고, 그 외에는 빈 배열입니다. */
  rejected: EnrollmentApplicant[];
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
  /** 내가 개설자인지. false면 연사자로 참여하는 강연입니다. */
  creator?: boolean;
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
  /** 개설자를 포함한 연사자 목록입니다. */
  speakers?: LectureSpeaker[];
  lectureStatus: LectureStatusType;
  /** 백엔드 응답에 아직 없습니다. 내려오기 시작하면 화면이 저절로 켜집니다. */
  approvalStatus?: LectureApprovalStatusType;
  /** 거절된 강연에만 옵니다. 이것도 아직 응답에 없습니다. */
  rejectionReason?: string;
  capacityByGrade?: GradeCapacities;
  totalCapacity?: number | null;
  enrolledCount: number;
  waitingCount: number;
  /** 목록 응답에는 없고 상세 응답에만 옵니다. */
  myEnrollmentStatus?: EnrollmentStatusType | null;
  lectureLocation: string | null;
  lectureDate: string | null;
  lectureTime: string | null;
  applicationDeadline?: string | null;
  createdAt: string;
  /** 학생회가 승인한 시각. 승인 전이면 비어 있습니다. */
  approvedAt?: string | null;
}
