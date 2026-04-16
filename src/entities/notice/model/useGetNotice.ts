import { useQuery } from "@tanstack/react-query";
import { noticeQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { noticeUrl } from "@/shared/api/apiUrls";
import type { NoticeType } from "./types";

const getNotice = (id: number): Promise<NoticeType> => {
  return get<NoticeType>(noticeUrl.getOne(id));
};

export const useGetNotice = (id: number) => {
  return useQuery({
    queryKey: noticeQueryKeys.getOne(id),
    queryFn: () => getNotice(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
