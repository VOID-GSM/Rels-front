// 백엔드 API 엔드포인트는 Next rewrite를 통해 같은 출처의 /api 경로로 프록시됩니다.
export const authUrl = {
  getUserInfo: () => "/api/auth/me",
} as const;

export const lectureUrl = {
  getAll: () => "/api/lectures",
  create: () => "/api/lectures",
  getOne: (id: number) => `/api/lectures/${id}`,
  update: (id: number) => `/api/lectures/${id}`,
  delete: (id: number) => `/api/lectures/${id}`,
  enroll: (id: number) => `/api/lectures/${id}/enrollments`,
  cancelEnrollment: (id: number) => `/api/lectures/${id}/enrollments`,
  getEnrollments: (id: number) => `/api/lectures/${id}/enrollments`,
} as const;

export const noticeUrl = {
  getAll: () => "/api/notices",
  getOne: (id: number) => `/api/notices/${id}`,
  create: () => "/api/notices",
  update: (id: number) => `/api/notices/${id}`,
  delete: (id: number) => `/api/notices/${id}`,
} as const;

export const authUrls = {
  dgStart: (redirectUri: string) =>
    `/api/auth/dg/start?redirectUri=${encodeURIComponent(redirectUri)}`,
  dgCallback: (code: string, state: string) =>
    `/api/auth/dg/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
} as const;
