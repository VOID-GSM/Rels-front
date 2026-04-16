import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noticeQueryKeys } from "@/shared/api/queryKeys";
import { patch } from "@/shared/api";
import { noticeUrl } from "@/shared/api/apiUrls";
import type { NoticeType } from "./types";

interface UpdateNoticeReq {
  title: string;
  content: string;
}

const updateNotice = (id: number, data: UpdateNoticeReq): Promise<NoticeType> => {
  return patch<NoticeType, UpdateNoticeReq>(noticeUrl.update(id), data);
};

export const useUpdateNotice = (id: number, options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNoticeReq) => updateNotice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeQueryKeys.getAll() });
      queryClient.invalidateQueries({ queryKey: noticeQueryKeys.getOne(id) });
      options?.onSuccess?.();
    },
  });
};
