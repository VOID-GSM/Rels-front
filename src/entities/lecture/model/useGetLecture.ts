import { useQuery } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureType } from "./types";

const getLecture = (id: number): Promise<LectureType> => {
  return get<LectureType>(lectureUrl.getOne(id));
};

export const useGetLecture = (id: number) => {
  return useQuery({
    queryKey: lectureQueryKeys.getOne(id),
    queryFn: () => getLecture(id),
    enabled: !!id,
  });
};
