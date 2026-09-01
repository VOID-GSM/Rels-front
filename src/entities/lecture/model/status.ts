import type {
  LectureStatusType,
  LectureType,
  RawLectureStatusType,
} from "./types";

const MIN_CONFIRMED_ENROLLMENT_COUNT = 10;

/**
 * 백엔드 enum 이름을 화면이 쓰는 이름으로 옮깁니다. 지금은 CLOSE -> CLOSED 하나뿐입니다.
 * 서버가 이름을 또 바꾸거나 새 상태를 추가하면 여기만 고치면 됩니다.
 */
const SERVER_STATUS_ALIAS: Record<string, LectureStatusType> = {
  CLOSE: "CLOSED",
};

/**
 * 서버가 준 상태를 화면이 아는 상태로 바꿉니다. 모르는 값이 오면 종료로 두는 대신
 * 그대로 흘려보내지 않고 OPEN으로 떨어뜨립니다. 상태 맵에 없는 키가 그대로 넘어가면
 * 배지를 그리다 화면 전체가 죽기 때문입니다.
 */
export const normalizeLectureStatus = (
  status: RawLectureStatusType | string,
): LectureStatusType => {
  if (status in SERVER_STATUS_ALIAS) return SERVER_STATUS_ALIAS[status];
  if (
    status === "OPEN" ||
    status === "CONFIRMED" ||
    status === "CLOSED" ||
    status === "UNCONFIRMED"
  ) {
    return status;
  }
  return "OPEN";
};

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
  const lectureStatus = normalizeLectureStatus(lecture.lectureStatus);

  if (lectureStatus === "CLOSED") return lectureStatus;

  if (lecture.lectureDate && lecture.lectureTime) {
    const lectureDateTime = new Date(
      `${lecture.lectureDate}T${lecture.lectureTime}`,
    );

    const ONE_HOUR_MS = 60 * 60 * 1000;
    if (
      !Number.isNaN(lectureDateTime.getTime()) &&
      lectureDateTime.getTime() + ONE_HOUR_MS < Date.now()
    ) {
      return "CLOSED";
    }
  }

  if (lectureStatus !== "OPEN") return lectureStatus;
  if (!lecture.applicationDeadline) return lectureStatus;

  const deadline = new Date(lecture.applicationDeadline);
  if (Number.isNaN(deadline.getTime())) return lectureStatus;

  if (
    deadline.getTime() < Date.now() &&
    lecture.enrolledCount < MIN_CONFIRMED_ENROLLMENT_COUNT
  ) {
    return "UNCONFIRMED";
  }

  return lectureStatus;
};
