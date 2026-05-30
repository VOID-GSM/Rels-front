"use client";

import { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import ConfirmModal from "@/components/common/ConfirmModal";
import Arrow from "@/assets/svg/Arrow";
import Delete from "@/assets/svg/Delete";
import LectureForm from "@/components/lecture/LectureForm";
import type { LectureFormData } from "@/components/lecture/LectureForm";
import { useGetLecture, useUpdateLecture, useDeleteLecture } from "@/entities/lecture";
import type { LectureType } from "@/entities/lecture";

function EditForm({ lecture }: { lecture: LectureType }) {
  const router = useRouter();
  const lectureId = lecture.lectureId;
  const capacityMode = lecture.totalCapacity != null ? "total" : "grade";

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
              capacityMode,
              totalCapacity: String(lecture.totalCapacity ?? ""),
              grade1: String(lecture.capacityByGrade?.["1"] ?? ""),
              grade2: String(lecture.capacityByGrade?.["2"] ?? ""),
              grade3: String(lecture.capacityByGrade?.["3"] ?? ""),
              lectureLocation: lecture.lectureLocation ?? "",
              lectureDate: lecture.lectureDate ?? "",
              lectureTime: lecture.lectureTime ?? "",
              applicationDeadline: lecture.applicationDeadline ?? "",
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
        <ConfirmModal
          title="강연 삭제"
          message="강연을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?"
          confirmLabel="삭제"
          confirmClassName="bg-error border-error hover:bg-error/90"
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
  if (isLoading || !lecture) return <Spinner />;

  return <EditForm lecture={lecture} />;
}
