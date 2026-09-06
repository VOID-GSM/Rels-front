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
  /**
   * 신청 마감 시각. 서버가 계산해 주지 않으니 요청에 반드시 담아야 하고,
   * 빠지면 400입니다. 사용자가 입력한 로컬 시각 문자열(`2026-09-10T18:00`)이라
   * 서버가 찍는 UTC 시각과 달리 parseServerDateTime을 쓰면 안 됩니다.
   * 서버는 "마감 < 강연 시작"만 검사합니다.
   */
  applicationDeadline?: string | null;
  /** 개설자 외 연사자들의 userId. */
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
