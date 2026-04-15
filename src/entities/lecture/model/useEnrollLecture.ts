import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { post } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureType } from "./types";

interface EnrollResponse {
  lectureId: number;
  enrollmentStatus: "ENROLLED" | "WAITING";
  enrolledCount: number;
  waitingCount: number;
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
          };
        },
      );
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
