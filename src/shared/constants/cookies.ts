// httpOnly 쿠키 키 상수
// 토큰은 반드시 httpOnly 쿠키에만 저장 (document.cookie / localStorage / sessionStorage 금지)
export const COOKIE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;
