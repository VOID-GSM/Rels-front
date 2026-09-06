import { useQuery } from "@tanstack/react-query";
import { get } from "@/shared/api";
import { userUrl } from "@/shared/api/apiUrls";
import { userQueryKeys } from "@/shared/api/queryKeys";
import type { UserSummary } from "./types";

const searchUsers = (keyword: string): Promise<UserSummary[]> => {
  return get<UserSummary[]>(userUrl.search(), { params: { keyword } });
};

/**
 * 이름이나 학번으로 사람을 찾습니다.
 * 검색어가 비면 서버가 전체 명부를 내려주지 않도록 요청 자체를 보내지 않습니다.
 */
export const useSearchUsers = (keyword: string) => {
  const trimmed = keyword.trim();

  return useQuery({
    queryKey: userQueryKeys.search(trimmed),
    queryFn: () => searchUsers(trimmed),
    enabled: trimmed.length > 0,
    // 같은 검색어를 다시 치는 일이 잦아서 잠깐은 캐시를 그대로 씁니다.
    staleTime: 30_000,
  });
};
