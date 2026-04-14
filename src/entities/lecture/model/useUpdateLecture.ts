import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { patch } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureType } from "./types";

export interface UpdateLectureData {
  title?: string;
  description?: string;
  maxCount?: number;
  lectureLocation?: string;
  lectureDate?: string;
  lectureTime?: string;
}

const updateLecture = (id: number, data: UpdateLectureData): Promise<LectureType> => {
  return patch<LectureType, UpdateLectureData>(lectureUrl.update(id), data);
};

export const useUpdateLecture = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLectureData) => updateLecture(id, data),
    onSuccess: (updatedLecture) => {
      // PATCH 응답으로 캐시 직접 업데이트 (재조회 없음 → 깜빡임 방지)
      queryClient.setQueryData(lectureQueryKeys.getOne(id), updatedLecture);
      // 목록만 무효화 (메인 페이지 갱신)
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.getAll() });
    },
  });
};
