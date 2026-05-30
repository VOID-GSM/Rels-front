import { useQuery } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { EnrollmentApplicant, LectureEnrollmentsType } from "./types";

const getRequestedAtTime = (requestedAt: string) => {
  const time = new Date(requestedAt).getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
};

const sortByRequestedAt = (applicants: EnrollmentApplicant[]) => {
  return [...applicants].sort((a, b) => {
    const requestedAtDiff =
      getRequestedAtTime(a.requestedAt) - getRequestedAtTime(b.requestedAt);

    if (requestedAtDiff !== 0) return requestedAtDiff;

    return a.userId - b.userId;
  });
};

const getEnrollments = async (id: number): Promise<LectureEnrollmentsType> => {
  const enrollments = await get<LectureEnrollmentsType>(
    lectureUrl.getEnrollments(id),
  );

  return {
    ...enrollments,
    enrolled: sortByRequestedAt(enrollments.enrolled),
    waiting: sortByRequestedAt(enrollments.waiting),
  };
};

export const useGetEnrollments = (id: number) => {
  return useQuery({
    queryKey: lectureQueryKeys.getEnrollments(id),
    queryFn: () => getEnrollments(id),
    enabled: !!id,
    staleTime: 0,
    retry: false,
  });
};
