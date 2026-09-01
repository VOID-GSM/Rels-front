interface SpeakerLike {
  name: string;
  studentNumber?: string | null;
}

interface LectureLike {
  /** 서버가 개설자까지 포함해서 내려줍니다. */
  speakers?: SpeakerLike[] | null;
  creatorName: string;
  creatorStudentNumber?: string | null;
}

const withStudentNumber = (speaker: SpeakerLike) =>
  speaker.studentNumber ? `${speaker.studentNumber} ${speaker.name}` : speaker.name;

/**
 * "2204 김지유, 2101 이수민" — 강연자 줄에 쓰는 문구입니다.
 * speakers가 아직 안 내려오는 응답에서는 개설자 한 명만 적습니다.
 */
export const formatSpeakers = (lecture: LectureLike): string => {
  if (lecture.speakers && lecture.speakers.length > 0) {
    return lecture.speakers.map(withStudentNumber).join(", ");
  }

  return withStudentNumber({
    name: lecture.creatorName,
    studentNumber: lecture.creatorStudentNumber,
  });
};
