import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noticeQueryKeys } from "@/shared/api/queryKeys";
import { del } from "@/shared/api";
import { noticeUrl } from "@/shared/api/apiUrls";

const deleteNotice = (id: number): Promise<void> => {
  return del<void>(noticeUrl.delete(id));
};

export const useDeleteNotice = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeQueryKeys.getAll() });
      options?.onSuccess?.();
    },
    onError: () => {
      options?.onError?.();
    },
  });
};
