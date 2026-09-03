import Link from "next/link";
import type { MyCreatedLecture, MyEnrolledLecture } from "@/entities/lecture";
import {
  LECTURE_APPROVAL_NOTICE,
  LECTURE_STATUS_LABEL,
} from "@/constants/lecture";
import { isAfterDeadline } from "@/shared/lib/enrollmentWindow";

export type MyPageLectureItem = (MyCreatedLecture | MyEnrolledLecture) & {
  meta?: string;
};

export default function LectureItem({
  lecture,
  onAction,
  actionLabel,
  disabled,
}: {
  lecture: MyPageLectureItem;
  onAction: (id: number) => void;
  actionLabel: string;
  disabled?: boolean;
}) {
  const statusLabel =
    LECTURE_STATUS_LABEL[lecture.lectureStatus] ?? lecture.lectureStatus;

  // 개설한 강연에만 붙습니다. 승인 전에는 강연 상태보다 이게 먼저 알 일입니다.
  const approvalStatus =
    "approvalStatus" in lecture ? lecture.approvalStatus : undefined;
  const isRejected = approvalStatus === "REJECTED";
  const approvalNotice =
    approvalStatus === "PENDING"
      ? LECTURE_APPROVAL_NOTICE.PENDING
      : isRejected
        ? LECTURE_APPROVAL_NOTICE.REJECTED
        : null;
  const rejectionReason =
    isRejected && "rejectionReason" in lecture ? lecture.rejectionReason : null;

  // 거절된 신청은 되돌릴 것이 없어서 취소 버튼 대신 결과만 보여 줍니다.
  const isEnrollmentRejected =
    "enrollmentStatus" in lecture && lecture.enrollmentStatus === "REJECTED";
  // 마감 뒤에는 확정된 신청을 취소할 수 없습니다. 대기는 그대로 뺄 수 있습니다.
  const isCancelClosed =
    "enrollmentStatus" in lecture &&
    lecture.enrollmentStatus === "ENROLLED" &&
    isAfterDeadline(lecture.applicationDeadline);
  // 연사자로 참여하는 강연도 이 목록에 섞여 옵니다. 삭제는 개설자만 할 수 있습니다.
  const isSpeakerOnly = "creator" in lecture && lecture.creator === false;

  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors ${
        approvalNotice
          ? "bg-gray-100 hover:bg-gray-200"
          : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <Link
        href={`/lectures/${lecture.lectureId}`}
        className="focusable flex min-w-0 flex-1 flex-col gap-1 rounded-lg"
      >
        <span className="line-clamp-1 text-sm font-semibold text-gray-900">
          {lecture.title}
        </span>
        <span className="line-clamp-1 text-xs text-gray-600">
          {lecture.meta ? `${lecture.meta} · ` : ""}
          {approvalNotice ? (
            <span
              className={`font-semibold ${
                isRejected ? "text-error" : "text-gray-500"
              }`}
            >
              {approvalNotice}
            </span>
          ) : (
            statusLabel
          )}
        </span>
        {/* 거절 사유는 다시 열어 볼 때 가장 먼저 찾는 내용이라 제목 바로 밑에 둡니다. */}
        {rejectionReason && (
          <span className="line-clamp-1 text-xs text-gray-600">
            사유 · {rejectionReason}
          </span>
        )}
      </Link>
      {isEnrollmentRejected || isSpeakerOnly || isCancelClosed ? (
        <span className="shrink-0 px-2 py-1 text-xs font-semibold text-gray-400">
          {isSpeakerOnly ? "연사자" : isEnrollmentRejected ? "거절됨" : "마감"}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onAction(lecture.lectureId)}
          disabled={disabled}
          className="focusable shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-error transition-colors hover:bg-error-soft disabled:text-gray-300 disabled:hover:bg-transparent"
        >
          {actionLabel}
        </button>
      )}
    </li>
  );
}
