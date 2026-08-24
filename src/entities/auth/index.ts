export type {
  OAuthSignInReqType,
  OAuthSignInType,
  AccountRoleType,
  StudentRoleType,
  MajorType,
  StudentType,
  UserInfoType,
} from "./model/types";

export { useGetUserInfo } from "./model/useGetUserInfo";

// 디자인 작업용 임시 목 데이터 (작업 종료 후 제거)
export { MOCK_USER } from "./model/mocks";
