export function getOAuthRedirectUri() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");

  return `${baseUrl.replace(/\/+$/, "")}/callback`;
}
