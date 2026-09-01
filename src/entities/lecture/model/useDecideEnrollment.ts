import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { patch } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { EnrollmentDecisionRequest, EnrollmentStatusType } from "./types";

interface DecideEnrollmentVariables extends EnrollmentDecisionRequest {
  /** 수락하거나 거절할 대기자. */
  userId: number;
}

interface DecideEnrollmentResponse {
  lectureId: number;
  enrollmentStatus: EnrollmentStatusType;
  enrolledCount: number;
  waitingCount: number;
  requestedAt: string;
}

const decideEnrollment = (
  lectureId: number,
  { userId, ...body }: DecideEnrollmentVariables,
): Promise<DecideEnrollmentResponse> => {
  return patch<DecideEnrollmentResponse, EnrollmentDecisionRequest>(
    lectureUrl.decideEnrollment(lectureId, userId),
    body,
  );
};

interface UseDecideEnrollmentOptions {
  onSuccess?: (
    data: DecideEnrollmentResponse,
    variables: DecideEnrollmentVariables,
  ) => void;
  onError?: (error: Error, variables: DecideEnrollmentVariables) => void;
}

/**
 * 대기자를 수락하거나 거절합니다. 개설자와 학생회만 호출할 수 있습니다.
 * 수락하면 정원과 상관없이 바로 신청자로 올라가서 인원수가 정원을 넘길 수 있습니다.
 */
export const useDecideEnrollment = (
  lectureId: number,
  options?: UseDecideEnrollmentOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: DecideEnrollmentVariables) =>
      decideEnrollment(lectureId, variables),
    onSuccess: (data, variables) => {
      // 명단·인원수·상대방의 내 신청 상태가 한꺼번에 바뀝니다.
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getEnrollments(lectureId),
      });
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getOne(lectureId),
      });
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.getAll() });
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getMyEnrollments(),
      });
      options?.onSuccess?.(data, variables);
    },
    onError: (error: Error, variables) => {
      options?.onError?.(error, variables);
    },
  });
};
