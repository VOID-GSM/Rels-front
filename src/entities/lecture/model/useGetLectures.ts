import { useQuery } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureType } from "./types";

const getLectures = async (): Promise<LectureType[]> => {
  const res = await get<{ content: LectureType[] }>(lectureUrl.getAll());
  return res.content;
};

export const useGetLectures = () => {
  return useQuery({
    queryKey: lectureQueryKeys.getAll(),
    queryFn: getLectures,
    staleTime: 1000 * 60 * 5,
  });
};
