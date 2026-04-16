import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { patch } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureType, GradeCapacities } from "./types";

export interface UpdateLectureData {
  title: string;
  description: string;
  gradeCapacities: GradeCapacities;
  lectureLocation?: string;
  lectureDate?: string;
  lectureTime?: string;
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
    },
  });
};
