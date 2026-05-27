export function getOAuthRedirectUri() {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_BASE_URL ?? "");

  return `${baseUrl.replace(/\/+$/, "")}/callback`;
}
