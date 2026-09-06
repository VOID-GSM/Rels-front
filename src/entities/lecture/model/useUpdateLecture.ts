import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { patch } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureType, GradeCapacities } from "./types";

export interface UpdateLectureData {
  title?: string;
  description?: string;
  totalCapacity?: number | null;
  capacityByGrade?: GradeCapacities | null;
  lectureLocation?: string | null;
  lectureDate?: string | null;
  lectureTime?: string | null;
  /**
   * 신청 마감 시각. 서버가 계산해 주지 않으니 수정 요청에도 반드시 담아야 하고,
   * 빠지면 400입니다. 사용자가 입력한 로컬 시각 문자열(`2026-09-10T18:00`)이라
   * 서버가 찍는 UTC 시각과 달리 parseServerDateTime을 쓰면 안 됩니다.
   * 서버는 "마감 < 강연 시작"만 검사합니다.
   */
  applicationDeadline?: string | null;
  /** 개설자 외 연사자들의 userId. */
  speakerIds?: number[];
}

export interface UpdateLectureSettingsData {
  lectureLocation?: string;
  lectureDate?: string;
  lectureTime?: string;
}

const updateLecture = (
  id: number,
  data: UpdateLectureData | UpdateLectureSettingsData,
): Promise<LectureType> => {
  return patch<LectureType, UpdateLectureData | UpdateLectureSettingsData>(
    lectureUrl.update(id),
    data,
  );
};

export const useUpdateLecture = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLectureData | UpdateLectureSettingsData) =>
      updateLecture(id, data),
    onSuccess: (updatedLecture) => {
      queryClient.setQueryData(lectureQueryKeys.getOne(id), updatedLecture);
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.getAll() });
      // 학생회가 승인 화면에서 바로 고칠 수 있어서 대기 목록도 다시 받습니다.
      queryClient.invalidateQueries({
        queryKey: lectureQueryKeys.getPending(),
      });
    },
  });
};
