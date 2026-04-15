import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { post } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureType, GradeCapacities } from "./types";

interface CreateLectureReqType {
  title: string;
  description: string;
  gradeCapacities: GradeCapacities;
  lectureLocation?: string;
  lectureDate?: string;
  lectureTime?: string;
}

const createLecture = (data: CreateLectureReqType): Promise<LectureType> => {
  return post<LectureType, CreateLectureReqType>(lectureUrl.create(), data);
};

export const useCreateLecture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLecture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lectureQueryKeys.all });
    },
  });
};
