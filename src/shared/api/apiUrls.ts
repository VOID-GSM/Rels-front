// 백엔드 API 엔드포인트는 Next rewrite를 통해 같은 출처의 /api 경로로 프록시됩니다.
export const authUrl = {
  // 변경 시 shared/lib/axios.ts의 AUTH_VERIFY_PATH도 함께 수정해야 합니다.
  getUserInfo: () => "/api/auth/me",
  // 변경 시 shared/lib/axios.ts의 REFRESH_PATH도 함께 수정해야 합니다.
  refresh: () => "/api/auth/refresh",
} as const;

export const lectureUrl = {
  getAll: () => "/api/lectures",
  getPending: () => "/api/lectures/pending",
  create: () => "/api/lectures",
  getOne: (id: number) => `/api/lectures/${id}`,
  update: (id: number) => `/api/lectures/${id}`,
  delete: (id: number) => `/api/lectures/${id}`,
  enroll: (id: number) => `/api/lectures/${id}/enrollments`,
  cancelEnrollment: (id: number) => `/api/lectures/${id}/enrollments`,
  getEnrollments: (id: number) => `/api/lectures/${id}/enrollments`,
  updateApproval: (id: number) => `/api/lectures/${id}/approval`,
  getAttendances: (id: number) => `/api/lectures/${id}/attendances`,
  updateAttendances: (id: number) => `/api/lectures/${id}/attendances`,
  getMyEnrollments: () => "/api/lectures/enrollments/me",
} as const;

export const noticeUrl = {
  getAll: () => "/api/notices",
  getOne: (id: number) => `/api/notices/${id}`,
  create: () => "/api/notices",
  update: (id: number) => `/api/notices/${id}`,
  delete: (id: number) => `/api/notices/${id}`,
} as const;

export const notificationUrl = {
  subscribe: () => "/api/notifications/subscribe",
} as const;

// 백엔드 절대 URL (trailing slash 제거).
// dgStart는 window.location 전체 페이지 이동 + OAuth 302 흐름에서 Next rewrite가
// 동작하지 않으므로 예외적으로 절대 백엔드 URL을 사용합니다.
const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(
  /\/+$/,
  "",
);

export const authUrls = {
  dgStart: (redirectUri: string) =>
    `${BACKEND_BASE_URL}/api/auth/dg/start?redirectUri=${encodeURIComponent(redirectUri)}`,
  dgCallback: (code: string, state: string) =>
    `/api/auth/dg/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
} as const;
