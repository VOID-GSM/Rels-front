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
    if (!title.trim()) next.title = "공지 제목을 입력해주세요.";
    if (!content.trim()) next.content = "공지 내용을 입력해주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateNotice({ title: title.trim(), content: content.trim() });
  };

  return (
    <main className="max-w-[600px] mx-auto px-6 py-10 flex flex-col gap-6">
      <Link
        href="/notification"
        className="flex items-center gap-1 text-sm text-gray-500 w-fit"
      >
        <Arrow />
        취소
      </Link>

      <div className="border border-main-200 rounded-2xl p-8 flex flex-col gap-6">
        <h1 className="text-xl font-bold text-gray-900">공지 수정</h1>

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

        <Button onClick={handleSave} disabled={isPending} className="py-3">
          {isPending ? "저장 중..." : "저장"}
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

  if (isLoading || !notice) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
        <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
      </div>
    );
  }

  return <EditForm notice={notice} noticeId={noticeId} />;
}
