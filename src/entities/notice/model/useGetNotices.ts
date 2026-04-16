import { useQuery } from "@tanstack/react-query";
import { noticeQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { noticeUrl } from "@/shared/api/apiUrls";
import type { NoticeListResponse } from "./types";

const getNotices = (): Promise<NoticeListResponse> => {
  return get<NoticeListResponse>(noticeUrl.getAll());
};

export const useGetNotices = () => {
  return useQuery({
    queryKey: noticeQueryKeys.getAll(),
    queryFn: getNotices,
    staleTime: 1000 * 60 * 5,
  });
};
