import { useMutation } from "@tanstack/react-query";
import { authQueryKeys } from "@/shared/api/queryKeys";
import type { OAuthSignInReqType } from "./types";

const postSignIn = async (body: OAuthSignInReqType): Promise<void> => {
  const res = await fetch("/api/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "로그인에 실패했습니다.");
  }
};

export const usePostSignIn = () => {
  return useMutation({
    mutationKey: authQueryKeys.postSignIn(),
    mutationFn: postSignIn,
  });
};
