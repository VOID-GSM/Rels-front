import People from "@/assets/svg/People";
import Clock from "@/assets/svg/Clock";
import Cancel from "@/assets/svg/Cancel";
import type { EnrollmentApplicant } from "@/entities/lecture";
import CopyApplicantsButton from "@/components/lecture/CopyApplicantsButton";

export type ApplicantListType = "applicant" | "waiting" | "rejected";

const LIST_CONFIG: Record<
  ApplicantListType,
  { title: string; empty: string }
> = {
  applicant: { title: "신청자", empty: "아직 신청자가 없습니다." },
  waiting: { title: "대기자", empty: "정원이 차면 대기자가 표시됩니다." },
  rejected: { title: "거절한 신청", empty: "거절한 신청이 없습니다." },
};

type ApplicantListProps = {
  applicants: EnrollmentApplicant[];
  /** 학생회만 명단 복사 버튼을 봅니다. */
  copyable?: boolean;
  /**
   * 대기자를 수락·거절할 수 있는 사람에게만 넘깁니다.
   * 넘기지 않으면 대기자 명단은 이름만 보이는 읽기 전용입니다.
   */
  onDecide?: (userId: number, approved: boolean) => void;
  /** 지금 처리 중인 대기자. 그 줄의 버튼만 잠깁니다. */
  decidingUserId?: number | null;
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
  | {
      type: "rejected";
      currentCount?: never;
      maxCount?: never;
      waitingCount?: never;
    }
);

export default function ApplicantList({
  type,
  currentCount,
  maxCount,
  waitingCount,
  applicants,
  copyable = false,
  onDecide,
  decidingUserId = null,
}: ApplicantListProps) {
  const { title, empty } = LIST_CONFIG[type];
  const isApplicant = type === "applicant";
  const isRejected = type === "rejected";
  // 수락·거절은 대기 중인 사람에게만 의미가 있습니다.
  const isDecidable = type === "waiting" && !!onDecide;

  const count = isApplicant ? `${currentCount}/${maxCount}` : null;

  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl bg-surface p-5 shadow-e2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={isRejected ? "text-gray-400" : "text-main"}>
          {isApplicant ? <People /> : isRejected ? <Cancel /> : <Clock />}
        </span>
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        <span className="tnum text-sm text-gray-500">
          {count ?? (type === "waiting" ? waitingCount : applicants.length)}
        </span>
        {copyable && applicants.length > 0 && (
          <CopyApplicantsButton applicants={applicants} className="ml-auto" />
        )}
      </div>

      {applicants.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-500">{empty}</p>
      ) : (
        <ul className="scrollbar-hide flex max-h-[320px] flex-col gap-1.5 overflow-y-auto">
          {applicants.map((applicant, index) => {
            const isDeciding = decidingUserId === applicant.userId;

            return (
              <li
                key={applicant.userId}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-3.5 py-2.5"
              >
                <span className="tnum w-4 shrink-0 text-xs font-semibold text-gray-500">
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span
                    className={`truncate text-sm font-semibold ${
                      isRejected ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    {applicant.name}
                  </span>
                  <span className="tnum text-xs text-gray-600">
                    {applicant.studentNumber}
                  </span>
                </div>

                {isDecidable && (
                  // 이름 오른쪽에 붙여야 "누구를" 수락하는지 헷갈리지 않습니다.
                  <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onDecide(applicant.userId, true)}
                      disabled={isDeciding}
                      className="focusable cursor-pointer rounded-lg bg-main px-2.5 py-1.5 text-xs font-semibold text-gray-900 transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      수락
                    </button>
                    <button
                      type="button"
                      onClick={() => onDecide(applicant.userId, false)}
                      disabled={isDeciding}
                      className="focusable cursor-pointer rounded-lg bg-surface px-2.5 py-1.5 text-xs font-semibold text-error shadow-e1 transition-colors hover:bg-error-soft disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      거절
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
