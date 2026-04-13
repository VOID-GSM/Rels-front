// DataGSM OAuth 토큰 교환 요청 타입
export interface OAuthSignInReqType {
  authCode: string;
  redirectUri: string;
  codeVerifier: string;
}

// 토큰 교환 성공 응답 타입
export interface OAuthSignInType {
  accessToken: string;
}

// 계정 역할 타입 (관리자 / 일반 유저)
export type AccountRoleType = "ADMIN" | "USER";

// 학생 역할 타입
export type StudentRoleType =
  | "GENERAL_STUDENT"
  | "STUDENT_COUNCIL"
  | "DORMITORY_MANAGER"
  | "GRADUATE"
  | "WITHDRAWN";

// 전공 타입
export type MajorType = "SW_DEVELOPMENT" | "SMART_IOT" | "AI";

// 학생 정보 타입
export interface StudentType {
  id: number;
  name: string;
  sex: "MAN" | "WOMAN";
  grade: number;
  classNum: number;
  number: number;
  studentNumber: number;
  major: MajorType;
  specialty: string | null;
  dormitoryFloor: number | null;
  dormitoryRoom: number | null;
  role: StudentRoleType;
  isLeaveSchool: boolean;
}

// 사용자 정보 타입 (학생이 아닌 경우 student는 null)
export interface UserInfoType {
  id: number;
  email: string;
  role: AccountRoleType;
  isStudent: boolean;
  student: StudentType | null;
}
