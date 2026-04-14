import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { post } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureType } from "./types";

interface CreateLectureReqType {
  title: string;
  description: string;
  maxCount: number;
}

const createLecture = (data: Pick<CreateLectureReqType, "title" | "description">): Promise<LectureType> => {
  return post<LectureType, CreateLectureReqType>(lectureUrl.create(), {
    ...data,
    maxCount: 30,
  });
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
