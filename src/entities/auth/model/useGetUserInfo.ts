import { useQuery } from "@tanstack/react-query";
import { authQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { authUrl } from "@/shared/api/apiUrls";
import useAuthStore from "@/stores/authStore";
import type { UserInfoType } from "./types";

const getUserInfo = async (): Promise<UserInfoType> => {
  return get<UserInfoType>(authUrl.getUserInfo());
};

export const useGetUserInfo = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: authQueryKeys.getUserInfo(),
    queryFn: getUserInfo,
    enabled: isLoggedIn,
    // 만료 토큰 재시도는 의미가 없고 세션 정리만 늦추므로 재시도하지 않습니다.
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
