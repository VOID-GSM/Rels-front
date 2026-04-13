const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// 백엔드 API 엔드포인트 (클라이언트 axios 전용 — baseURL이 BACKEND_URL이므로 경로만 작성)
export const authUrl = {
  getUserInfo: () => "/api/auth/me",
} as const;

export const lectureUrl = {
  getAll: () => "/api/lectures",
} as const;

// 직접 fetch가 필요한 경우를 위한 전체 URL
export const authUrls = {
  dgStart: (redirectUri: string) =>
    `${BACKEND_URL}/api/auth/dg/start?redirectUri=${encodeURIComponent(redirectUri)}`,
  dgCallback: (code: string, state: string) =>
    `${BACKEND_URL}/api/auth/dg/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
} as const;
