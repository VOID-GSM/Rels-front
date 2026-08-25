import { useQuery } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import { parseServerDateTime } from "@/shared/lib/serverDateTime";
import type { LectureType } from "./types";

// 승인 대기 목록. 오래 기다린 강연이 위로 오도록 개설 순으로 세웁니다.
const getPendingLectures = async (): Promise<LectureType[]> => {
  const res = await get<{ content: LectureType[] }>(lectureUrl.getPending());
  const content = res?.content ?? [];

  const createdTime = (lecture: LectureType) =>
    parseServerDateTime(lecture.createdAt)?.getTime() ?? 0;

  return [...content].sort((a, b) => createdTime(a) - createdTime(b));
};

interface UseGetPendingLecturesOptions {
  /** 학생회가 아닌 계정은 요청 자체를 보내지 않습니다. */
  enabled?: boolean;
}

export const useGetPendingLectures = (
  options?: UseGetPendingLecturesOptions,
) => {
  return useQuery({
    queryKey: lectureQueryKeys.getPending(),
    queryFn: getPendingLectures,
    enabled: options?.enabled ?? true,
    staleTime: 0,
    retry: false,
  });
};
