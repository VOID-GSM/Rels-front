"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Arrow from "@/assets/svg/Arrow";
import { useCreateLecture } from "@/entities/lecture";

export default function CreateLecturePage() {
  const router = useRouter();
  const { mutate: createLecture, isPending } = useCreateLecture();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "강연 제목을 입력해주세요.";
    if (!description.trim()) next.description = "강연 내용을 입력해주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    createLecture(
      { title: title.trim(), description: description.trim() },
      {
        onSuccess: () => {
          router.push("/");
        },
      },
    );
  };

  return (
    <main className="max-w-[600px] mx-auto px-6 py-10 flex flex-col gap-6">
      <Link
        href="/"
        className="flex items-center gap-1 text-sm text-gray-500 w-fit"
      >
        <Arrow />
        뒤로
      </Link>

      <div className="border border-main-200 rounded-2xl p-8 flex flex-col gap-6">
        <h1 className="text-xl font-bold text-gray-900">강연 생성</h1>

        <div className="flex flex-col gap-4">
          <Input
            label="강연 제목"
            placeholder="강연 제목"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
          />

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-gray-700">강연 내용</label>
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

          <p className="text-xs text-gray-400">
            최대 인원, 장소, 일정은 생성 후 수정에서 설정할 수 있습니다.
          </p>
        </div>

        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isPending}
          className="py-3"
        >
          {isPending ? "생성 중..." : "강연 생성"}
        </Button>
      </div>
    </main>
  );
}
