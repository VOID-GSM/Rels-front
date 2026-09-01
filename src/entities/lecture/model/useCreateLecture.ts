import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { post } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureType, GradeCapacities } from "./types";

interface CreateLectureReqType {
  title: string;
  description: string;
  capacityByGrade?: GradeCapacities | null;
  totalCapacity?: number | null;
  lectureLocation?: string | null;
  lectureDate?: string | null;
  lectureTime?: string | null;
  /** 개설자 외 연사자들의 userId. 신청 마감일은 서버가 강연 날짜에서 계산합니다. */
  speakerIds?: number[];
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
