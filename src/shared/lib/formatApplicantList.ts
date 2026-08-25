interface ApplicantLine {
  name: string;
  studentNumber: string;
}

/**
 * 신청자 명단을 "1. 2204 김지유" 형태로 한 줄씩 이어 붙입니다.
 * 학생회가 다른 곳(카톡, 시트)에 그대로 붙여 넣는 용도라 번호를 함께 씁니다.
 */
export const formatApplicantList = (applicants: ApplicantLine[]): string =>
  applicants
    .map((applicant, index) => {
      const label = [applicant.studentNumber, applicant.name]
        .filter(Boolean)
        .join(" ");

      return `${index + 1}. ${label}`;
    })
    .join("\n");
