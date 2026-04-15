import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { del } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";

const deleteLecture = (id: number): Promise<void> => {
  return del<void>(lectureUrl.delete(id));
};

export const useDeleteLecture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLecture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.all });
    },
  });
};
