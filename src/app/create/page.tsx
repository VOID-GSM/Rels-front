"use client";

import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PageHeader from "@/components/layout/PageHeader";
import BackLink from "@/components/layout/BackLink";
import LectureForm from "@/components/lecture/LectureForm";
import type { LectureFormData } from "@/components/lecture/LectureForm";
import { useCreateLecture } from "@/entities/lecture";

export default function CreateLecturePage() {
  const router = useRouter();
  const { mutate: createLecture, isPending } = useCreateLecture();

  const handleSubmit = (data: LectureFormData) => {
    createLecture(data, { onSuccess: () => router.push("/") });
  };

  return (
    <PageShell size="narrow">
      <BackLink href="/lectures">전체 강연</BackLink>
      <PageHeader
        className="mt-5 pb-4"
        title="강연 개설"
        description="다른 학생들이 신청할 수 있는 강연을 엽니다. 개설 후에도 마감 전까지 수정할 수 있습니다."
      />
      {/* 개설 버튼을 누른 뒤 목록에 안 보인다는 문의가 없도록, 쓰기 전에 알립니다. */}
      <p className="mb-8 rounded-xl bg-main-soft px-4 py-3.5 text-sm leading-relaxed text-gray-700">
        <span className="font-bold text-gray-900">
          학생회가 확인한 뒤에 공개됩니다.
        </span>{" "}
        개설하면 바로 올라가지 않고 학생회 확인을 기다립니다. 확인 전까지는
        개설자 본인과 학생회에게만 보이고, 거절되면 사유를 강연 상세에서 확인할
        수 있습니다.
      </p>
      <LectureForm
        onSubmit={handleSubmit}
        isPending={isPending}
        submitLabel="강연 개설"
      />
    </PageShell>
  );
}
