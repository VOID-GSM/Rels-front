"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import {
  useCancelEnrollmentById,
  useDeleteLecture,
  useGetMyLectureEnrollments,
  MOCK_MY_LECTURE_ENROLLMENTS,
} from "@/entities/lecture";
import { MOCK_USER } from "@/entities/auth";
import { useDesignPreview } from "@/shared/lib/useDesignPreview";
import { formatLectureDate } from "@/shared/lib/formatLectureSchedule";
import dynamic from "next/dynamic";
import CouncilBadge from "@/components/common/CouncilBadge";
import PageShell from "@/components/layout/PageShell";
import BackLink from "@/components/layout/BackLink";

const ConfirmModal = dynamic(() => import("@/components/common/ConfirmModal"), {
  ssr: false,
});
import HashTag from "@/assets/svg/HashTag";
import Mail from "@/assets/svg/Mail";
import Logout from "@/assets/svg/Logout";
import LectureList from "@/components/mypage/LectureList";
import type { MyPageLectureItem } from "@/components/mypage/LectureItem";
import { ENROLLMENT_STATUS_LABEL } from "@/constants/lecture";

function ProfileFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="shrink-0 text-gray-500">{icon}</span>
        <span className="truncate text-sm font-semibold text-gray-900">
          {value}
        </span>
      </div>
    </div>
  );
}

export default function MyPage() {
  const { user: loggedInUser, clearAuth } = useAuthStore();
  const router = useRouter();
  const { data: fetchedEnrollments, isLoading: isFetching } =
    useGetMyLectureEnrollments();
  // 디자인 작업용 임시 처리: 비로그인 상태에서는 목 데이터로 화면을 채웁니다.
  const isPreview = useDesignPreview();
  const user = isPreview ? MOCK_USER : loggedInUser;
  const myLectureEnrollments = isPreview
    ? MOCK_MY_LECTURE_ENROLLMENTS
    : fetchedEnrollments;
  const isLoading = isPreview ? false : isFetching;
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
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center">
        <p className="text-sm text-gray-500">로그인이 필요합니다.</p>
      </div>
    );
  }

  const myCreatedLectures: MyPageLectureItem[] = (
    myLectureEnrollments?.createdLectures ?? []
  ).map((lecture) => ({
    ...lecture,
    meta: [lecture.lectureLocation, formatLectureDate(lecture.lectureDate)]
      .filter(Boolean)
      .join(" · "),
  }));

  const myEnrolledLectures: MyPageLectureItem[] = (
    myLectureEnrollments?.enrolledLectures ?? []
  ).map((lecture) => ({
    ...lecture,
    meta: [
      lecture.creatorStudentNumber
        ? `${lecture.creatorStudentNumber} ${lecture.creatorName}`
        : lecture.creatorName,
      ENROLLMENT_STATUS_LABEL[
        lecture.enrollmentStatus as keyof typeof ENROLLMENT_STATUS_LABEL
      ] ?? lecture.enrollmentStatus,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  const handleConfirmDelete = () => {
    if (deleteTargetId === null) return;
    deleteLecture(deleteTargetId, {
      onSuccess: () => setDeleteTargetId(null),
      onError: () => setDeleteTargetId(null),
    });
  };

  return (
    <>
      <PageShell>
        <BackLink href="/">이번 주 강연</BackLink>

        {/* 프로필은 세로로 쌓지 않고 가로 띠 하나로 펼칩니다. */}
        <section className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-6 rounded-2xl bg-surface px-6 py-6 shadow-e2 md:px-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            {user.role === "ADMIN" && <CouncilBadge />}
          </div>

          <div className="flex flex-wrap items-center gap-x-12 gap-y-5">
            <ProfileFact
              icon={<HashTag />}
              label="학번"
              value={user.studentNumber}
            />
            <ProfileFact icon={<Mail />} label="이메일" value={user.email} />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="focusable ml-auto flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-error-soft hover:text-error"
          >
            <Logout />
            로그아웃
          </button>
        </section>

        <div className="mt-10 grid items-start gap-4 lg:grid-cols-2">
          <LectureList
            title="내가 개설한 강연"
            lectures={myCreatedLectures}
            emptyMessage="아직 개설한 강연이 없습니다."
            isLoading={isLoading}
            onAction={setDeleteTargetId}
            actionLabel="삭제"
          />
          <LectureList
            title="내가 신청한 강연"
            lectures={myEnrolledLectures}
            emptyMessage="아직 신청한 강연이 없습니다."
            isLoading={isLoading}
            onAction={cancelEnrollment}
            actionLabel="취소"
            disabled={isCancelling}
          />
        </div>
      </PageShell>

      {deleteTargetId !== null && (
        <ConfirmModal
          title="강연 삭제"
          message="강연을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?"
          confirmLabel="삭제"
          confirmVariant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTargetId(null)}
          isPending={isDeleting}
        />
      )}
    </>
  );
}
