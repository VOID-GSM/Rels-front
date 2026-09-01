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
  /** 개설자 외 연사자들의 userId. 신청 마감일은 서버가 강연 날짜에서 계산합니다. */
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
