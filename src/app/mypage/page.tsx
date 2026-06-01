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
import dynamic from "next/dynamic";
import CouncilBadge from "@/components/common/CouncilBadge";

const ConfirmModal = dynamic(() => import("@/components/common/ConfirmModal"), {
  ssr: false,
});
import Arrow from "@/assets/svg/Arrow";
import Person from "@/assets/svg/Person";
import HashTag from "@/assets/svg/HashTag";
import Mail from "@/assets/svg/Mail";
import Logout from "@/assets/svg/Logout";
import InfoField from "@/components/mypage/InfoField";
import LectureList from "@/components/mypage/LectureList";
import type { MyPageLectureItem } from "@/components/mypage/LectureItem";
import { ENROLLMENT_STATUS_LABEL } from "@/constants/lecture";

export default function MyPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const { data: myLectureEnrollments, isLoading } = useGetMyLectureEnrollments();
  const { mutate: deleteLecture, isPending: isDeleting } = useDeleteLecture();
  const { mutate: cancelEnrollment, isPending: isCancelling } = useCancelEnrollmentById();
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
      ENROLLMENT_STATUS_LABEL[lecture.enrollmentStatus as keyof typeof ENROLLMENT_STATUS_LABEL] ?? lecture.enrollmentStatus,
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
      <main className="max-w-[800px] mx-auto px-6 py-10 flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 w-fit">
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
            <InfoField icon={<HashTag />} label="학번" value={user.studentNumber} />
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
          <LectureList
            title="내가 개설한 강연"
            lectures={myCreatedLectures}
            emptyMessage="생성한 강연이 없습니다."
            isLoading={isLoading}
            onAction={setDeleteTargetId}
            actionLabel="삭제"
          />
          <LectureList
            title="내가 신청한 강연"
            lectures={myEnrolledLectures}
            emptyMessage="신청한 강연이 없습니다."
            isLoading={isLoading}
            onAction={cancelEnrollment}
            actionLabel="취소"
            disabled={isCancelling}
          />
        </div>
      </main>

      {deleteTargetId !== null && (
        <ConfirmModal
          title="강연 삭제"
          message="강연을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?"
          confirmLabel="삭제"
          confirmClassName="bg-error border-error hover:bg-error/90"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTargetId(null)}
          isPending={isDeleting}
        />
      )}
    </>
  );
}
