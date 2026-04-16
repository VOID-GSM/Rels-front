const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// 백엔드 API 엔드포인트 (클라이언트 axios 전용 — baseURL이 BACKEND_URL이므로 경로만 작성)
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
  delete: (id: number) => `/api/lectures/${id}`,
} as const;

export const noticeUrl = {
  getAll: () => "/api/notices",
  getOne: (id: number) => `/api/notices/${id}`,
  create: () => "/api/notices",
  update: (id: number) => `/api/notices/${id}`,
  delete: (id: number) => `/api/notices/${id}`,
} as const;

// 직접 fetch가 필요한 경우를 위한 전체 URL
export const authUrls = {
  dgStart: (redirectUri: string) =>
    `${BACKEND_URL}/api/auth/dg/start?redirectUri=${encodeURIComponent(redirectUri)}`,
  dgCallback: (code: string, state: string) =>
    `${BACKEND_URL}/api/auth/dg/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
} as const;
