import type { LectureStatusType, LectureType } from "./types";

const MIN_CONFIRMED_ENROLLMENT_COUNT = 10;

export const getDisplayLectureStatus = (
  lecture: Pick<
    LectureType,
    | "lectureStatus"
    | "applicationDeadline"
    | "enrolledCount"
    | "lectureDate"
    | "lectureTime"
  >,
): LectureStatusType => {
  if (lecture.lectureStatus === "CLOSED") return lecture.lectureStatus;

  if (lecture.lectureDate && lecture.lectureTime) {
    const lectureDateTime = new Date(
      `${lecture.lectureDate}T${lecture.lectureTime}`,
    );

    if (
      !Number.isNaN(lectureDateTime.getTime()) &&
      lectureDateTime.getTime() < Date.now()
    ) {
      return "CLOSED";
    }
  }

  if (lecture.lectureStatus !== "OPEN") return lecture.lectureStatus;
  if (!lecture.applicationDeadline) return lecture.lectureStatus;

  const deadline = new Date(lecture.applicationDeadline);
  if (Number.isNaN(deadline.getTime())) return lecture.lectureStatus;

  if (
    deadline.getTime() < Date.now() &&
    lecture.enrolledCount < MIN_CONFIRMED_ENROLLMENT_COUNT
  ) {
    return "UNCONFIRMED";
  }

  return lecture.lectureStatus;
};
