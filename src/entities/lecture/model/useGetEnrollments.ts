import { useQuery } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import { parseServerDateTime } from "@/shared/lib/serverDateTime";
import type { EnrollmentApplicant, LectureEnrollmentsType } from "./types";

// 신청 시각도 서버가 찍는 값이라 오프셋 없이 UTC로 옵니다.
const getRequestedAtTime = (requestedAt?: string | null) =>
  parseServerDateTime(requestedAt)?.getTime() ?? null;

/**
 * 신청한 순서대로 세웁니다. 명단 순서가 곧 대기 순번이라 기준은 신청 시각뿐입니다.
 * 시각이 비어 오면 학번 순으로 밀리지 않도록 서버가 준 순서를 그대로 둡니다.
 */
const sortByRequestedAt = (applicants: EnrollmentApplicant[]) => {
  return [...applicants].sort((a, b) => {
    const aTime = getRequestedAtTime(a.requestedAt);
    const bTime = getRequestedAtTime(b.requestedAt);

    if (aTime == null || bTime == null) return 0;

    return aTime - bTime;
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
    // 거절 명단은 개설자·학생회에게만 오고, 그 외에는 비어 있습니다.
    rejected: sortByRequestedAt(enrollments.rejected ?? []),
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
