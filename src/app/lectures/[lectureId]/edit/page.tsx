"use client";

import { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import Button from "@/components/common/Button";
import Arrow from "@/assets/svg/Arrow";
import Delete from "@/assets/svg/Delete";
import LectureForm from "@/components/common/LectureForm";
import type { LectureFormData } from "@/components/common/LectureForm";
import { useGetLecture, useUpdateLecture, useDeleteLecture } from "@/entities/lecture";
import type { LectureType } from "@/entities/lecture";

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

function EditForm({ lecture }: { lecture: LectureType }) {
  const router = useRouter();
  const lectureId = lecture.lectureId;

  const { mutate: updateLecture, isPending: isUpdating } = useUpdateLecture(lectureId);
  const { mutate: deleteLecture, isPending: isDeleting } = useDeleteLecture();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSubmit = (data: LectureFormData) => {
    updateLecture(data, { onSuccess: () => router.push(`/lectures/${lectureId}`) });
  };

  const handleConfirmDelete = () => {
    deleteLecture(lectureId, { onSuccess: () => router.push("/") });
  };

  return (
    <>
      <main className="max-w-[600px] mx-auto px-6 py-10 flex flex-col gap-6">
        <Link
          href={`/lectures/${lectureId}`}
          className="flex items-center gap-1 text-sm text-gray-500 w-fit"
        >
          <Arrow />
          취소
        </Link>

        <div className="border border-main-200 rounded-2xl p-8 flex flex-col gap-6">
          <h1 className="text-xl font-bold text-gray-900">강연 수정</h1>
          <LectureForm
            initialValues={{
              title: lecture.title,
              description: lecture.description,
              grade1: String(lecture.gradeCapacities["1"]),
              grade2: String(lecture.gradeCapacities["2"]),
              grade3: String(lecture.gradeCapacities["3"]),
              lectureLocation: lecture.lectureLocation ?? "",
              lectureDate: lecture.lectureDate ?? "",
              lectureTime: lecture.lectureTime ?? "",
            }}
            onSubmit={handleSubmit}
            isPending={isUpdating}
            submitLabel="저장"
            extraAction={
              <Button
                variant="cancel"
                onClick={() => setShowDeleteModal(true)}
                disabled={isUpdating || isDeleting}
                className="py-3 flex items-center justify-center gap-2"
              >
                <Delete />
                삭제
              </Button>
            }
          />
        </div>
      </main>

      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          isPending={isDeleting}
        />
      )}
    </>
  );
}

export default function EditLecturePage() {
  const params = useParams();
  const lectureId = Number(params.lectureId);
  const { data: lecture, isLoading } = useGetLecture(lectureId);

  if (isNaN(lectureId)) return notFound();

  if (isLoading || !lecture) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
        <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
      </div>
    );
  }

  return <EditForm lecture={lecture} />;
}
