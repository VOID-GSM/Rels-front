"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Arrow from "@/assets/svg/Arrow";
import LectureForm from "@/components/common/LectureForm";
import type { LectureFormData } from "@/components/common/LectureForm";
import { useCreateLecture } from "@/entities/lecture";

export default function CreateLecturePage() {
  const router = useRouter();
  const { mutate: createLecture, isPending } = useCreateLecture();

  const handleSubmit = (data: LectureFormData) => {
    createLecture(data, { onSuccess: () => router.push("/") });
  };

  return (
    <main className="max-w-[600px] mx-auto px-6 py-10 flex flex-col gap-6">
      <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 w-fit">
        <Arrow />
        뒤로
      </Link>

      <div className="border border-main-200 rounded-2xl p-8 flex flex-col gap-6">
        <h1 className="text-xl font-bold text-gray-900">강연 생성</h1>
        <LectureForm
          onSubmit={handleSubmit}
          isPending={isPending}
          submitLabel="강연 생성"
        />
      </div>
    </main>
  );
}
