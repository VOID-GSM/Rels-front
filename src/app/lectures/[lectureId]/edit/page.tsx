"use client";

import { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import dynamic from "next/dynamic";
import PageShell from "@/components/layout/PageShell";
import PageHeader from "@/components/layout/PageHeader";
import BackLink from "@/components/layout/BackLink";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";

const ConfirmModal = dynamic(() => import("@/components/common/ConfirmModal"), {
  ssr: false,
});
import Delete from "@/assets/svg/Delete";
import LectureForm from "@/components/lecture/LectureForm";
import type { LectureFormData } from "@/components/lecture/LectureForm";
import {
  useGetLecture,
  useUpdateLecture,
  useDeleteLecture,
} from "@/entities/lecture";
import type { LectureType } from "@/entities/lecture";

function EditForm({ lecture }: { lecture: LectureType }) {
  const router = useRouter();
  const lectureId = lecture.lectureId;
  const capacityMode = lecture.totalCapacity != null ? "total" : "grade";

  const { mutate: updateLecture, isPending: isUpdating } =
    useUpdateLecture(lectureId);
  const { mutate: deleteLecture, isPending: isDeleting } = useDeleteLecture();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSubmit = (data: LectureFormData) => {
    updateLecture(data, {
      onSuccess: () => router.push(`/lectures/${lectureId}`),
    });
  };

  const handleConfirmDelete = () => {
    deleteLecture(lectureId, { onSuccess: () => router.push("/") });
  };

  return (
    <>
      <PageShell size="narrow">
        <BackLink href={`/lectures/${lectureId}`}>강연 상세</BackLink>
        <PageHeader
          className="mt-5 pb-4"
          title="강연 수정"
          description="이미 신청한 학생이 있다면 인원과 일정 변경에 주의해 주세요."
        />
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
            // 서버가 내려주는 speakers에는 개설자도 들어 있어서 빼고 넘깁니다.
            speakers: (lecture.speakers ?? []).filter(
              (speaker) => speaker.userId !== lecture.creatorId,
            ),
          }}
          onSubmit={handleSubmit}
          isPending={isUpdating}
          submitLabel="저장"
          creatorId={lecture.creatorId}
          extraAction={
            <Button
              variant="cancel"
              onClick={() => setShowDeleteModal(true)}
              disabled={isUpdating || isDeleting}
              className="h-11 w-fit gap-2 px-7"
            >
              <Delete />
              삭제
            </Button>
          }
        />
      </PageShell>

      {showDeleteModal && (
        <ConfirmModal
          title="강연 삭제"
          message="강연을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?"
          confirmLabel="삭제"
          confirmVariant="danger"
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
