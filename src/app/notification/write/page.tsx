"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Arrow from "@/assets/svg/Arrow";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import useAuthStore from "@/stores/authStore";
import { useCreateNotice } from "@/entities/notice";

const TITLE_MAX_LENGTH = 360;
const CONTENT_MAX_LENGTH = 500;

export default function NoticeWritePage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { mutate: createNotice, isPending } = useCreateNotice({
    onSuccess: () => router.push("/notification"),
  });

  useEffect(() => {
    if (isLoggedIn && user && user.role !== "ADMIN") {
      router.replace("/notification");
    }
  }, [isLoggedIn, user, router]);

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-main/30 border-t-main" />
      </div>
    );
  }

  if (user.role !== "ADMIN") return null;

  const validate = () => {
    const next: typeof errors = {};
    if (!title.trim()) {
      next.title = "공지 제목을 입력해 주세요.";
    } else if (title.trim().length > TITLE_MAX_LENGTH) {
      next.title = `공지 제목은 ${TITLE_MAX_LENGTH}자 이내로 입력해 주세요.`;
    }

    if (!content.trim()) {
      next.content = "공지 내용을 입력해 주세요.";
    } else if (content.trim().length > CONTENT_MAX_LENGTH) {
      next.content = `공지 내용은 ${CONTENT_MAX_LENGTH}자 이내로 입력해 주세요.`;
    }

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
      <main className="mx-auto flex max-w-[600px] flex-col gap-6 px-6 py-10">
        <Link
          href="/notification"
          className="flex w-fit items-center gap-1 text-sm text-gray-500"
        >
          <Arrow />
          뒤로
        </Link>

        <div className="flex flex-col gap-6 rounded-2xl border border-main-200 p-8">
          <h1 className="text-xl font-bold text-gray-900">공지 작성</h1>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Input
                label="공지 제목"
                placeholder="공지 제목을 입력해 주세요."
                value={title}
                maxLength={TITLE_MAX_LENGTH}
                onChange={(e) => {
                  setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH));
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                error={errors.title}
              />
              <p className="text-right text-xs text-gray-400">
                {title.length}/{TITLE_MAX_LENGTH}
              </p>
            </div>

            <div className="flex w-full flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                공지 내용
              </label>
              <textarea
                placeholder="공지 내용을 입력해 주세요."
                value={content}
                maxLength={CONTENT_MAX_LENGTH}
                onChange={(e) => {
                  setContent(e.target.value.slice(0, CONTENT_MAX_LENGTH));
                  if (errors.content) {
                    setErrors((prev) => ({ ...prev, content: undefined }));
                  }
                }}
                rows={8}
                className={`w-full resize-none rounded-md border px-3 py-2 placeholder:text-gray-400 break-words whitespace-pre-wrap focus:outline-none transition-colors ${
                  errors.content
                    ? "border-error focus:border-error"
                    : "border-main-300 focus:border-main"
                }`}
              />
              <p className="text-right text-xs text-gray-400">
                {content.length}/{CONTENT_MAX_LENGTH}
              </p>
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

      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => !isPending && setIsConfirmOpen(false)}
        >
          <div
            className="mx-4 flex w-full max-w-[400px] flex-col gap-5 rounded-2xl bg-white p-6"
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
                {isPending ? "등록 중.." : "공지하기"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
