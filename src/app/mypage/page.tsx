"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import {
  useCancelEnrollmentById,
  useDeleteLecture,
  useGetMyLectureEnrollments,
} from "@/entities/lecture";
import type {
  LectureStatusType,
  MyCreatedLecture,
  MyEnrolledLecture,
} from "@/entities/lecture";
import CouncilBadge from "@/components/common/CouncilBadge";
import Button from "@/components/common/Button";
import Arrow from "@/assets/svg/Arrow";
import Person from "@/assets/svg/Person";
import HashTag from "@/assets/svg/HashTag";
import Mail from "@/assets/svg/Mail";
import Logout from "@/assets/svg/Logout";

const STATUS_LABEL: Record<LectureStatusType, string> = {
  OPEN: "개설 미정",
  CONFIRMED: "개설 확정",
  CLOSED: "강연 종료",
  UNCONFIRMED: "개설 불확정",
};

const ENROLLMENT_STATUS_LABEL: Record<string, string> = {
  ENROLLED: "신청 완료",
  WAITING: "대기 중",
};

type MyPageLectureItem = (MyCreatedLecture | MyEnrolledLecture) & {
  meta?: string;
};

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex-1 flex flex-col gap-1.5 bg-background rounded-xl p-3">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  );
}

function LectureItem({
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
    STATUS_LABEL[lecture.lectureStatus] ?? lecture.lectureStatus;

  return (
    <li className="flex items-center justify-between bg-background rounded-xl px-4 py-3 gap-3">
      <Link
        href={`/lectures/${lecture.lectureId}`}
        className="flex flex-col gap-1.5 flex-1 min-w-0"
      >
        <span className="text-sm font-medium text-gray-800 line-clamp-1">
          {lecture.title}
        </span>
        <div className="flex items-center gap-2 min-w-0">
          {lecture.meta && (
            <>
              <span className="text-xs text-gray-500 line-clamp-1">
                {lecture.meta}
              </span>
              <span className="text-gray-500">|</span>
            </>
          )}
          <span className="text-xs text-gray-500 shrink-0">{statusLabel}</span>
        </div>
      </Link>
      <button
        onClick={() => onAction(lecture.lectureId)}
        disabled={disabled}
        className="shrink-0 text-xs text-error hover:underline disabled:text-gray-300 disabled:hover:no-underline"
      >
        {actionLabel}
      </button>
    </li>
  );
}

function DeleteConfirmModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-[360px] mx-4 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold text-gray-900">강연 삭제</h2>
          <p className="text-sm text-gray-500">
            강연을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="cancel" onClick={onCancel} className="py-2.5">
            취소
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="py-2.5 bg-error border-error hover:bg-error/90"
          >
            {isPending ? "삭제 중..." : "삭제"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MyPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const { data: myLectureEnrollments, isLoading } =
    useGetMyLectureEnrollments();
  const { mutate: deleteLecture, isPending: isDeleting } = useDeleteLecture();
  const { mutate: cancelEnrollment, isPending: isCancelling } =
    useCancelEnrollmentById();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleLogout = () => {
    clearAuth();
    router.replace("/");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">로그인이 필요합니다.</p>
      </div>
    );
  }

  const myCreatedLectures: MyPageLectureItem[] = (
    myLectureEnrollments?.createdLectures ?? []
  ).map((lecture) => ({
    ...lecture,
    meta: [lecture.lectureLocation, lecture.lectureDate].filter(Boolean).join(" · "),
  }));

  const myEnrolledLectures: MyPageLectureItem[] = (
    myLectureEnrollments?.enrolledLectures ?? []
  ).map((lecture) => ({
    ...lecture,
    meta: [
      lecture.creatorStudentNumber
        ? `${lecture.creatorStudentNumber} ${lecture.creatorName}`
        : lecture.creatorName,
      ENROLLMENT_STATUS_LABEL[lecture.enrollmentStatus] ??
        lecture.enrollmentStatus,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId === null) return;
    deleteLecture(deleteTargetId, {
      onSuccess: () => setDeleteTargetId(null),
      onError: () => setDeleteTargetId(null),
    });
  };

  const handleCancelEnroll = (id: number) => {
    cancelEnrollment(id);
  };

  return (
    <>
      <main className="max-w-[800px] mx-auto px-6 py-10 flex flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-gray-500 w-fit"
        >
          <Arrow />
          뒤로
        </Link>

        <div className="border border-main-200 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Person width={20} height={20} />
            <span className="font-semibold text-xl">내 정보</span>
            {user.role === "ADMIN" && <CouncilBadge />}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <InfoField icon={<Person />} label="이름" value={user.name} />
            <InfoField
              icon={<HashTag />}
              label="학번"
              value={user.studentNumber}
            />
            <InfoField icon={<Mail />} label="이메일" value={user.email} />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-error text-error rounded-xl py-3 text-sm font-medium hover:bg-error/5 transition-colors"
          >
            <Logout />
            로그아웃
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 border border-main-200 rounded-2xl p-5 flex flex-col gap-3">
            <span className="font-semibold text-base">
              내가 개설한 강연 ({myCreatedLectures.length})
            </span>
            {isLoading ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                불러오는 중...
              </p>
            ) : myCreatedLectures.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                생성한 강연이 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {myCreatedLectures.map((lecture) => (
                  <LectureItem
                    key={lecture.lectureId}
                    lecture={lecture}
                    onAction={handleDelete}
                    actionLabel="삭제"
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="flex-1 border border-main-200 rounded-2xl p-5 flex flex-col gap-3">
            <span className="font-semibold text-base">
              내가 신청한 강연 ({myEnrolledLectures.length})
            </span>
            {isLoading ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                불러오는 중...
              </p>
            ) : myEnrolledLectures.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                신청한 강연이 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {myEnrolledLectures.map((lecture) => (
                  <LectureItem
                    key={lecture.lectureId}
                    lecture={lecture}
                    onAction={handleCancelEnroll}
                    actionLabel="취소"
                    disabled={isCancelling}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {deleteTargetId !== null && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTargetId(null)}
          isPending={isDeleting}
        />
      )}
    </>
  );
}
