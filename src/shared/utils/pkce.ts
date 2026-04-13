// Base64URL 인코딩: 표준 Base64의 +, /, = 문자를 URL-safe 문자로 변환
const base64UrlEncode = (array: Uint8Array): string => {
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

// 암호학적으로 안전한 랜덤 code_verifier 생성 (32바이트 = 43자 Base64URL)
export const generateCodeVerifier = (): string => {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes); // CSPRNG 필수
  return base64UrlEncode(randomBytes);
};

// code_verifier를 SHA-256으로 해시 후 Base64URL 인코딩하여 code_challenge 생성
export const generateCodeChallenge = async (
  codeVerifier: string,
): Promise<string> => {
  const encoded = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return base64UrlEncode(new Uint8Array(digest));
};

// DataGSM OAuth 인증 시작 URL 생성 (S256 방식 강제, plain 절대 금지)
export const createAuthorizeUrl = ({
  clientId,
  redirectUri,
  state,
  codeChallenge,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://oauth.authorization.datagsm.kr/v1/oauth/authorize?${params.toString()}`;
};
