import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { del } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";

const cancelEnrollment = (id: number): Promise<void> => {
  return del<void>(lectureUrl.cancelEnrollment(id));
};

interface UseCancelEnrollmentByIdOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCancelEnrollmentById = (options?: UseCancelEnrollmentByIdOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelEnrollment,
    onSuccess: (_, lectureId) => {
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.getAll() });
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.getOne(lectureId) });
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.getEnrollments(lectureId) });
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.getMyEnrollments() });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
