import { useQuery } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { MyLectureEnrollmentsType } from "./types";

const getMyLectureEnrollments = (): Promise<MyLectureEnrollmentsType> => {
  return get<MyLectureEnrollmentsType>(lectureUrl.getMyEnrollments());
};

export const useGetMyLectureEnrollments = () => {
  return useQuery({
    queryKey: lectureQueryKeys.getMyEnrollments(),
    queryFn: getMyLectureEnrollments,
    staleTime: 1000 * 60 * 1,
    retry: false,
  });
};
