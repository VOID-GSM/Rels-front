import { useQuery } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureEnrollmentsType } from "./types";

const getEnrollments = (id: number): Promise<LectureEnrollmentsType> => {
  return get<LectureEnrollmentsType>(lectureUrl.getEnrollments(id));
};

export const useGetEnrollments = (id: number) => {
  return useQuery({
    queryKey: lectureQueryKeys.getEnrollments(id),
    queryFn: () => getEnrollments(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 1,
    retry: false,
  });
};
