export function getOAuthRedirectUri() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return `${baseUrl.replace(/\/+$/, "")}/callback`;
}
