"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Arrow from "@/assets/svg/Arrow";
import Delete from "@/assets/svg/Delete";
import { useGetLecture, useUpdateLecture, useDeleteLecture } from "@/entities/lecture";

export default function EditLecturePage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = Number(params.lectureId);

  const { data: lecture, isLoading } = useGetLecture(lectureId);
  const { mutate: updateLecture, isPending: isUpdating } =
    useUpdateLecture(lectureId);
  const { mutate: deleteLecture, isPending: isDeleting } = useDeleteLecture();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (lecture) {
      setTitle(lecture.title);
      setDescription(lecture.description);
    }
  }, [lecture]);

  const validate = () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "강연 제목을 입력해주세요.";
    if (!description.trim()) next.description = "강연 내용을 입력해주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateLecture(
      { title: title.trim(), description: description.trim() },
      { onSuccess: () => router.push(`/lectures/${lectureId}`) },
    );
  };

  const handleDelete = () => {
    if (!confirm("강연을 삭제하시겠습니까?")) return;
    deleteLecture(lectureId, {
      onSuccess: () => router.push("/"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
        <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
      </div>
    );
  }

  return (
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

        <div className="flex flex-col gap-4">
          <Input
            label="강연 제목"
            placeholder="강연 제목"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title)
                setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
          />

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">
              강연 내용
            </label>
            <textarea
              placeholder="강연 내용을 입력하세요"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              rows={5}
              className={`w-full px-3 py-2 border rounded-md placeholder:text-gray-400 focus:outline-none transition-colors resize-none ${
                errors.description
                  ? "border-error focus:border-error"
                  : "border-main-300 focus:border-main"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-error">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isUpdating || isDeleting}
            className="py-3"
          >
            저장
          </Button>
          <Button
            variant="cancel"
            onClick={handleDelete}
            disabled={isUpdating || isDeleting}
            className="py-3 flex items-center justify-center gap-2"
          >
            <Delete />
            삭제
          </Button>
        </div>
      </div>
    </main>
  );
}
