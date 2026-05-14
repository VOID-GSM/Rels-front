"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Arrow from "@/assets/svg/Arrow";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import useAuthStore from "@/stores/authStore";
import { useGetNotice, useUpdateNotice } from "@/entities/notice";
import type { NoticeType } from "@/entities/notice";

const TITLE_MAX_LENGTH = 360;
const CONTENT_MAX_LENGTH = 500;

function EditForm({ notice, noticeId }: { notice: NoticeType; noticeId: number }) {
  const router = useRouter();
  const { mutate: updateNotice, isPending } = useUpdateNotice(noticeId, {
    onSuccess: () => router.push("/notification"),
  });

  const [title, setTitle] = useState(notice.title);
  const [content, setContent] = useState(notice.content);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

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

  const handleSave = () => {
    if (!validate()) return;
    updateNotice({ title: title.trim(), content: content.trim() });
  };

  return (
    <main className="mx-auto flex max-w-[600px] flex-col gap-6 px-6 py-10">
      <Link
        href="/notification"
        className="flex w-fit items-center gap-1 text-sm text-gray-500"
      >
        <Arrow />
        취소
      </Link>

      <div className="flex flex-col gap-6 rounded-2xl border border-main-200 p-8">
        <h1 className="text-xl font-bold text-gray-900">공지 수정</h1>

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

        <Button onClick={handleSave} disabled={isPending} className="py-3">
          {isPending ? "수정 중.." : "수정"}
        </Button>
      </div>
    </main>
  );
}

export default function NoticeEditPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = Number(params.noticeId);
  const { data: notice, isLoading } = useGetNotice(noticeId);
  const { user } = useAuthStore();

  useEffect(() => {
    if (notice && user) {
      const isAuthor = user.userId === notice.authorId;
      const isAdmin = user.role === "ADMIN";
      if (!isAuthor && !isAdmin) {
        router.replace("/notification");
      }
    }
  }, [notice, user, router]);

  if (isLoading || !notice || !user) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-main/30 border-t-main" />
      </div>
    );
  }

  return <EditForm notice={notice} noticeId={noticeId} />;
}
