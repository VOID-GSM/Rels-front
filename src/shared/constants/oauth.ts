// OAuth PKCE 흐름에서 sessionStorage 키 상수
// code_verifier와 state는 수십 초만 존재하는 일회성 값 → callback finally에서 즉시 삭제
export const OAUTH_SESSION_KEYS = {
  STATE: "oauthState",
  CODE_VERIFIER: "oauthCodeVerifier",
} as const;
