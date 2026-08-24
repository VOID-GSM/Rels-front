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
      <LectureForm
        onSubmit={handleSubmit}
        isPending={isPending}
        submitLabel="강연 개설"
      />
    </PageShell>
  );
}
