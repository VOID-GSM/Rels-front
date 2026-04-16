import People from "@/assets/svg/People";
import Clock from "@/assets/svg/Clock";

interface Applicant {
  id: string;
  name: string;
  grade: number;
  classNum: number;
  number: number;
}

type ApplicantListProps = {
  applicants: Applicant[];
} & (
  | {
      type: "applicant";
      currentCount: number;
      maxCount: number;
      waitingCount?: never;
    }
  | {
      type: "waiting";
      waitingCount: number;
      currentCount?: never;
      maxCount?: never;
    }
);

export default function ApplicantList({
  type,
  currentCount,
  maxCount,
  waitingCount,
  applicants,
}: ApplicantListProps) {
  const isApplicant = type === "applicant";

  return (
    <div className="border border-main-200 rounded-2xl p-5 flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2 font-semibold text-sm">
        {isApplicant ? <People isActive /> : <Clock isActive />}
        <span>
          {isApplicant
            ? `신청 현황 (${currentCount}/${maxCount})`
            : `대기 현황 (${waitingCount})`}
        </span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[320px] scrollbar-hide">
        {applicants.map((applicant, index) => (
          <div
            key={applicant.id}
            className="flex items-center gap-4 bg-main-100 px-4 py-2 rounded-[4px]"
          >
            <span className="text-sm text-gray-500 w-4">{index + 1}</span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-900">
                {applicant.name}
              </span>
              <span className="text-xs text-gray-500">
                {applicant.grade}학년 {applicant.classNum}반 {applicant.number}번
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
