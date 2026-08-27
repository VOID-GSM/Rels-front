interface ApplicantLine {
  name: string;
  studentNumber: string;
}

/**
 * 학번 오름차순 정렬용 키. 학번을 못 읽는 사람은 순서를 정할 수 없어 맨 뒤로 보냅니다.
 */
const getStudentNumberOrder = (studentNumber?: string): number => {
  const parsed = Number.parseInt(studentNumber ?? "", 10);

  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};

/**
 * 신청자 명단을 "1. 2204 김지유" 형태로 한 줄씩 이어 붙입니다.
 * 학생회가 다른 곳(카톡, 시트)에 그대로 붙여 넣는 용도라 번호를 함께 씁니다.
 *
 * 화면 명단은 신청 순서(=대기 순번)를 지켜야 하지만, 붙여 넣은 명단은 사람을
 * 찾아보는 용도라 학번 순이 읽기 좋습니다. 그래서 복사할 때만 다시 세웁니다.
 */
export const formatApplicantList = (applicants: ApplicantLine[]): string =>
  [...applicants]
    .sort((a, b) => {
      const order =
        getStudentNumberOrder(a.studentNumber) -
        getStudentNumberOrder(b.studentNumber);
      if (order !== 0) return order;

      return a.name.localeCompare(b.name, "ko");
    })
    .map((applicant, index) => {
      const label = [applicant.studentNumber, applicant.name]
        .filter(Boolean)
        .join(" ");

      return `${index + 1}. ${label}`;
    })
    .join("\n");
