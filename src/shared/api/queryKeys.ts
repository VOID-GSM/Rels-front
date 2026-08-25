export const authQueryKeys = {
  all: ["auth"] as const,
  getUserInfo: () => [...authQueryKeys.all, "getUserInfo"] as const,
  postSignIn: () => [...authQueryKeys.all, "postSignIn"] as const,
};

export const lectureQueryKeys = {
  all: ["lectures"] as const,
  getAll: () => [...lectureQueryKeys.all, "list"] as const,
  getPending: () => [...lectureQueryKeys.all, "pending"] as const,
  getOne: (id: number) => [...lectureQueryKeys.all, id] as const,
  getEnrollments: (id: number) => [...lectureQueryKeys.all, id, "enrollments"] as const,
  getAttendances: (id: number) => [...lectureQueryKeys.all, id, "attendances"] as const,
  getMyEnrollments: () => [...lectureQueryKeys.all, "enrollments", "me"] as const,
};

export const notificationQueryKeys = {
  all: ["notification"] as const,
};

export const noticeQueryKeys = {
  all: ["notices"] as const,
  getAll: () => [...noticeQueryKeys.all, "list"] as const,
  getOne: (id: number) => [...noticeQueryKeys.all, id] as const,
};
