"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Arrow from "@/assets/svg/Arrow";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import CharCountTextArea from "@/components/common/CharCountTextArea";
import useAuthStore from "@/stores/authStore";
import { useGetNotice, useUpdateNotice } from "@/entities/notice";
import type { NoticeType } from "@/entities/notice";
import {
  NOTICE_TITLE_MAX_LENGTH as TITLE_MAX_LENGTH,
  NOTICE_CONTENT_MAX_LENGTH as CONTENT_MAX_LENGTH,
} from "@/constants/notification";

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
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              error={errors.title}
            />
            <p className="text-right text-xs text-gray-400">
              {title.length}/{TITLE_MAX_LENGTH}
            </p>
          </div>

          <CharCountTextArea
            label="공지 내용"
            placeholder="공지 내용을 입력해 주세요."
            value={content}
            maxLength={CONTENT_MAX_LENGTH}
            rows={8}
            onChange={(v) => {
              setContent(v);
              if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
            }}
            error={errors.content}
          />
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

  if (isLoading || !notice || !user) return <Spinner />;

  return <EditForm notice={notice} noticeId={noticeId} />;
}
