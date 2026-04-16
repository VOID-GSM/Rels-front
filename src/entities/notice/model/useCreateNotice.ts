import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noticeQueryKeys } from "@/shared/api/queryKeys";
import { post } from "@/shared/api";
import { noticeUrl } from "@/shared/api/apiUrls";
import type { NoticeType } from "./types";

interface CreateNoticeReq {
  title: string;
  content: string;
}

const createNotice = (data: CreateNoticeReq): Promise<NoticeType> => {
  return post<NoticeType, CreateNoticeReq>(noticeUrl.create(), data);
};

export const useCreateNotice = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeQueryKeys.getAll() });
      options?.onSuccess?.();
    },
  });
};
