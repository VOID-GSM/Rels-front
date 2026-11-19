import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { del } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";

const removeEnrollment = (lectureId: number, userId: number): Promise<void> => {
  return del<void>(lectureUrl.removeEnrollment(lectureId, userId));
};

interface UseRemoveEnrollmentOptions {
  onSuccess?: (userId: number) => void;
  onError?: (error: Error, userId: number) => void;
}

/**
 * 학생회가 신청자나 대기자를 명단에서 뺍니다.
 * 본인 취소와 달리 신청 마감 뒤에도 확정된 신청을 지울 수 있습니다.
 * 마감 전이면 서버가 대기 1번을 신청자로 올리고, 마감 뒤에는 올리지 않습니다.
 */
export const useRemoveEnrollment = (
  lectureId: number,
  options?: UseRemoveEnrollmentOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => removeEnrollment(lectureId, userId),
    onSuccess: (_, userId) => {
      // 명단·출석부·인원수·당사자의 내 신청 목록이 한꺼번에 바뀝니다.
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getEnrollments(lectureId),
      });
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getAttendances(lectureId),
      });
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getOne(lectureId),
      });
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.getAll() });
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getMyEnrollments(),
      });
      options?.onSuccess?.(userId);
    },
    onError: (error: Error, userId) => {
      options?.onError?.(error, userId);
    },
  });
};
