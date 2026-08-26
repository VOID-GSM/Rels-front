import { useQuery } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureAttendance } from "./types";

const getAttendances = async (id: number): Promise<LectureAttendance[]> => {
  const attendances = await get<LectureAttendance[]>(
    lectureUrl.getAttendances(id),
  );

  // 순서는 화면에서 신청 명단에 맞춰 세웁니다(orderByAllocation). 여기서는 건드리지 않습니다.
  return attendances ?? [];
};

interface UseGetAttendancesOptions {
  /** 학생회가 아닌 사용자에게는 요청 자체를 보내지 않습니다. */
  enabled?: boolean;
}

export const useGetAttendances = (
  id: number,
  options?: UseGetAttendancesOptions,
) => {
  return useQuery({
    queryKey: lectureQueryKeys.getAttendances(id),
    queryFn: () => getAttendances(id),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 0,
    retry: false,
  });
};
