"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Arrow from "@/assets/svg/Arrow";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useCreateNotice } from "@/entities/notice";

export default function NoticeWritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { mutate: createNotice, isPending } = useCreateNotice({
    onSuccess: () => router.push("/notification"),
  });

  const validate = () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "공지 제목을 입력해주세요.";
    if (!content.trim()) next.content = "공지 내용을 입력해주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitClick = () => {
    if (!validate()) return;
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    createNotice({ title: title.trim(), content: content.trim() });
  };

  return (
    <>
      <main className="max-w-[600px] mx-auto px-6 py-10 flex flex-col gap-6">
        <Link
          href="/notification"
          className="flex items-center gap-1 text-sm text-gray-500 w-fit"
        >
          <Arrow />
          뒤로
        </Link>

        <div className="border border-main-200 rounded-2xl p-8 flex flex-col gap-6">
          <h1 className="text-xl font-bold text-gray-900">공지 작성</h1>

          <div className="flex flex-col gap-4">
            <Input
              label="공지 제목"
              placeholder="공지 제목을 입력하세요"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
              }}
              error={errors.title}
            />

            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-700">공지 내용</label>
              <textarea
                placeholder="공지 내용을 입력하세요"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors((p) => ({ ...p, content: undefined }));
                }}
                rows={8}
                className={`w-full px-3 py-2 border rounded-md placeholder:text-gray-400 focus:outline-none transition-colors resize-none ${
                  errors.content
                    ? "border-error focus:border-error"
                    : "border-main-300 focus:border-main"
                }`}
              />
              {errors.content && (
                <p className="text-xs text-error">{errors.content}</p>
              )}
            </div>
          </div>

          <Button onClick={handleSubmitClick} disabled={isPending} className="py-3">
            공지 등록
          </Button>
        </div>
      </main>

      {/* 확인 모달 */}
      {isConfirmOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setIsConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-[400px] mx-4 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-bold text-gray-900">공지 등록 확인</h2>
              <p className="text-sm text-gray-500">
                공지를 등록하면 모든 학생에게 공지됩니다. 정말 공지하시겠습니까?
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="cancel"
                onClick={() => setIsConfirmOpen(false)}
                className="py-2.5"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isPending}
                className="py-2.5"
              >
                {isPending ? "등록 중..." : "공지하기"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
