import People from "@/assets/svg/People";
import Clock from "@/assets/svg/Clock";
import type { EnrollmentApplicant } from "@/entities/lecture";
import CopyApplicantsButton from "@/components/lecture/CopyApplicantsButton";

type ApplicantListProps = {
  applicants: EnrollmentApplicant[];
  /** 학생회만 명단 복사 버튼을 봅니다. */
  copyable?: boolean;
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
  copyable = false,
}: ApplicantListProps) {
  const isApplicant = type === "applicant";

  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl bg-surface p-5 shadow-e2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-main">
          {isApplicant ? <People /> : <Clock />}
        </span>
        <h2 className="text-sm font-bold text-gray-900">
          {isApplicant ? "신청자" : "대기자"}
        </h2>
        <span className="tnum text-sm text-gray-500">
          {isApplicant ? `${currentCount}/${maxCount}` : waitingCount}
        </span>
        {copyable && applicants.length > 0 && (
          <CopyApplicantsButton applicants={applicants} className="ml-auto" />
        )}
      </div>

      {applicants.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-500">
          {isApplicant
            ? "아직 신청자가 없습니다."
            : "정원이 차면 대기자가 표시됩니다."}
        </p>
      ) : (
        <ul className="scrollbar-hide flex max-h-[320px] flex-col gap-1.5 overflow-y-auto">
          {applicants.map((applicant, index) => (
            <li
              key={applicant.userId}
              className="flex items-center gap-3 rounded-xl bg-gray-50 px-3.5 py-2.5"
            >
              <span className="tnum w-4 shrink-0 text-xs font-semibold text-gray-500">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-gray-900">
                  {applicant.name}
                </span>
                <span className="tnum text-xs text-gray-600">
                  {applicant.studentNumber}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
