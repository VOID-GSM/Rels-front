import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { patch } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureApprovalRequest } from "./types";

interface ApprovalVariables extends LectureApprovalRequest {
  lectureId: number;
}

const updateLectureApproval = ({
  lectureId,
  ...body
}: ApprovalVariables): Promise<void> => {
  return patch<void, LectureApprovalRequest>(
    lectureUrl.updateApproval(lectureId),
    body,
  );
};

interface UseUpdateLectureApprovalOptions {
  onSuccess?: (variables: ApprovalVariables) => void;
  onError?: (error: Error) => void;
}

export const useUpdateLectureApproval = (
  options?: UseUpdateLectureApprovalOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLectureApproval,
    onSuccess: (_, variables) => {
      // 승인 대기 목록에서 빠지고, 수락된 강연은 학생 목록에 새로 나타납니다.
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.getPending() });
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.getAll() });
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getOne(variables.lectureId),
      });
      options?.onSuccess?.(variables);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
