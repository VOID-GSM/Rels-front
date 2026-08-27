import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { post } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { EnrollmentStatusType, LectureType } from "./types";

interface EnrollResponse {
  lectureId: number;
  enrollmentStatus: EnrollmentStatusType;
  enrolledCount: number;
  waitingCount: number;
  requestedAt: string;
}

const enrollLecture = (id: number): Promise<EnrollResponse> => {
  return post<EnrollResponse>(lectureUrl.enroll(id));
};

interface UseEnrollLectureOptions {
  onSuccess?: (data: EnrollResponse) => void;
  onError?: (error: Error) => void;
}

export const useEnrollLecture = (
  lectureId: number,
  options?: UseEnrollLectureOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => enrollLecture(lectureId),
    onSuccess: (data) => {
      queryClient.setQueryData<LectureType>(
        lectureQueryKeys.getOne(lectureId),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            enrolledCount: data.enrolledCount,
            waitingCount: data.waitingCount,
            // 상세를 다시 불러오기 전까지도 내 상태가 바로 반영되도록 함께 채웁니다.
            myEnrollmentStatus: data.enrollmentStatus,
          };
        },
      );
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getAll(),
      });
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getEnrollments(lectureId),
      });
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getMyEnrollments(),
      });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
