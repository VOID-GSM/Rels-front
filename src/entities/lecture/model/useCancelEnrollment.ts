import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { del } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";

const cancelEnrollment = (id: number): Promise<void> => {
  return del<void>(lectureUrl.cancelEnrollment(id));
};

interface UseCancelEnrollmentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCancelEnrollment = (
  lectureId: number,
  options?: UseCancelEnrollmentOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelEnrollment(lectureId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getOne(lectureId),
      });
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getEnrollments(lectureId),
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
