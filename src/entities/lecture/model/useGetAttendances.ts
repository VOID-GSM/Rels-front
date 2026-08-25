import { useQuery } from "@tanstack/react-query";
import { lectureQueryKeys } from "@/shared/api/queryKeys";
import { get } from "@/shared/api";
import { lectureUrl } from "@/shared/api/apiUrls";
import type { LectureAttendance } from "./types";

// 출석을 부르는 순서와 맞도록 학번 오름차순으로 세웁니다. 학번이 같으면 이름순.
const sortByStudentNumber = (attendances: LectureAttendance[]) => {
  return [...attendances].sort(
    (a, b) =>
      a.studentNumber.localeCompare(b.studentNumber, "ko") ||
      a.name.localeCompare(b.name, "ko"),
  );
};

const getAttendances = async (id: number): Promise<LectureAttendance[]> => {
  const attendances = await get<LectureAttendance[]>(
    lectureUrl.getAttendances(id),
  );

  return sortByStudentNumber(attendances ?? []);
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
