export type LectureStatusType = "OPEN" | "PENDING" | "CLOSED";

export interface LectureType {
  lectureId: number;
  title: string;
  description: string;
  creatorId: number;
  creatorName: string;
  lectureStatus: LectureStatusType;
  enrolledCount: number;
  waitingCount: number;
  lectureLocation: string | null;
  lectureDate: string | null;
  lectureTime: string | null;
  createdAt: string;
}
