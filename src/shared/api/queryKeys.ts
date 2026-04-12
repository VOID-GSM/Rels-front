// TanStack Query 쿼리 키 중앙 관리
export const authQueryKeys = {
  all: ["auth"] as const,
  getUserInfo: () => [...authQueryKeys.all, "getUserInfo"] as const,
  postSignIn: () => [...authQueryKeys.all, "postSignIn"] as const,
};
