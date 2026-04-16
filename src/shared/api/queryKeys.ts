// TanStack Query 쿼리 키 중앙 관리
export const authQueryKeys = {
  all: ["auth"] as const,
  getUserInfo: () => [...authQueryKeys.all, "getUserInfo"] as const,
  postSignIn: () => [...authQueryKeys.all, "postSignIn"] as const,
};

export const lectureQueryKeys = {
  all: ["lectures"] as const,
  getAll: () => [...lectureQueryKeys.all, "list"] as const,
  getOne: (id: number) => [...lectureQueryKeys.all, id] as const,
  getEnrollments: (id: number) => [...lectureQueryKeys.all, id, "enrollments"] as const,
};

export const noticeQueryKeys = {
  all: ["notices"] as const,
  getAll: () => [...noticeQueryKeys.all, "list"] as const,
  getOne: (id: number) => [...noticeQueryKeys.all, id] as const,
};
