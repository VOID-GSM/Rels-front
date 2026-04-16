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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
