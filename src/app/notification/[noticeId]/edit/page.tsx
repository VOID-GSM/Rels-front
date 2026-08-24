"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import PageHeader from "@/components/layout/PageHeader";
import BackLink from "@/components/layout/BackLink";
import FormSection, { FormActions } from "@/components/layout/FormSection";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import CharCountTextArea from "@/components/common/CharCountTextArea";
import useAuthStore from "@/stores/authStore";
import { useGetNotice, useUpdateNotice, MOCK_NOTICES } from "@/entities/notice";
import { MOCK_USER } from "@/entities/auth";
import { useDesignPreview } from "@/shared/lib/useDesignPreview";
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
    <PageShell size="narrow">
      <BackLink href="/notification">공지 목록</BackLink>
      <PageHeader
        className="mt-5 pb-4"
        title="공지 수정"
        description="이미 읽은 학생에게는 다시 알림이 가지 않습니다."
      />

      <FormSection
        title="공지 내용"
        description="모든 학생이 목록과 상단 배너에서 보게 됩니다. 핵심을 먼저 적어 주세요."
      >
        <div className="flex flex-col gap-1">
          <Input
            label="공지 제목"
            placeholder="예) 6월 릴레이 스터디 신청 기간 안내"
            value={title}
            maxLength={TITLE_MAX_LENGTH}
            onChange={(e) => {
              setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH));
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
          />
          <p className="tnum text-right text-xs text-gray-500">
            {title.length}/{TITLE_MAX_LENGTH}
          </p>
        </div>

        <CharCountTextArea
          label="공지 내용"
          placeholder="언제부터 언제까지, 무엇을 해야 하는지 적어 주세요."
          value={content}
          maxLength={CONTENT_MAX_LENGTH}
          rows={10}
          onChange={(v) => {
            setContent(v);
            if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
          }}
          error={errors.content}
        />
      </FormSection>

      <FormActions>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="h-11 w-full"
        >
          {isPending ? "수정 중" : "수정"}
        </Button>
      </FormActions>
    </PageShell>
  );
}

export default function NoticeEditPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = Number(params.noticeId);
  const { data: fetchedNotice, isLoading } = useGetNotice(noticeId);
  const { user: loggedInUser } = useAuthStore();
  // 디자인 작업용 임시 처리: 비로그인 상태에서는 목 데이터로 화면을 채웁니다.
  const isPreview = useDesignPreview();
  const user = isPreview ? MOCK_USER : loggedInUser;
  const notice = isPreview
    ? MOCK_NOTICES.content.find((n) => n.id === noticeId)
    : fetchedNotice;

  useEffect(() => {
    if (notice && user) {
      const isAuthor = user.userId === notice.authorId;
      const isAdmin = user.role === "ADMIN";
      if (!isAuthor && !isAdmin) {
        router.replace("/notification");
      }
    }
  }, [notice, user, router]);

  if ((!isPreview && isLoading) || !notice || !user) return <Spinner />;

  return <EditForm notice={notice} noticeId={noticeId} />;
}
