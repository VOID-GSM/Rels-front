import type { UserInfoType } from "./types";

/**
 * 디자인 작업용 임시 목 데이터입니다.
 * 로그인하지 않은 상태에서 화면을 확인하기 위해서만 사용하고,
 * 디자인 수정이 끝나면 이 파일과 사용처를 함께 제거하세요.
 *
 * 관리자 전용 UI(공지 작성/수정, 학생회 뱃지)까지 한 번에 보기 위해
 * role은 ADMIN으로 둡니다.
 */
export const MOCK_USER: UserInfoType = {
  userId: 1,
  email: "s2301@gsm.hs.kr",
  name: "김하늘",
  role: "ADMIN",
  studentNumber: "2301",
  major: "SW_DEVELOPMENT",
};
