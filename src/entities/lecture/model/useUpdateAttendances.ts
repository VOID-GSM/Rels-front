import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { patch } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { AttendanceUpdate } from "./types";

// 백엔드가 배열을 받으므로 바뀐 인원만 모아 한 번에 보냅니다.
const updateAttendances = (
  id: number,
  updates: AttendanceUpdate[],
): Promise<void> => {
  return patch<void, AttendanceUpdate[]>(
    lectureUrl.updateAttendances(id),
    updates,
  );
};

interface UseUpdateAttendancesOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useUpdateAttendances = (
  lectureId: number,
  options?: UseUpdateAttendancesOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: AttendanceUpdate[]) =>
      updateAttendances(lectureId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getAttendances(lectureId),
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
