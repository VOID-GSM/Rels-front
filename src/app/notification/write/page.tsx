"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PageShell from "@/components/layout/PageShell";
import PageHeader from "@/components/layout/PageHeader";
import BackLink from "@/components/layout/BackLink";
import FormSection, { FormActions } from "@/components/layout/FormSection";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";

const ConfirmModal = dynamic(() => import("@/components/common/ConfirmModal"), {
  ssr: false,
});
import CharCountTextArea from "@/components/common/CharCountTextArea";
import useAuthStore from "@/stores/authStore";
import { useCreateNotice } from "@/entities/notice";
import {
  NOTICE_TITLE_MAX_LENGTH as TITLE_MAX_LENGTH,
  NOTICE_CONTENT_MAX_LENGTH as CONTENT_MAX_LENGTH,
} from "@/constants/notification";

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

  if (!user) return <Spinner />;
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
      <PageShell size="narrow">
        <BackLink href="/notification">공지 목록</BackLink>
        <PageHeader
          className="mt-5 pb-4"
          title="공지 작성"
          description="등록하면 모든 학생의 화면 상단에 배너로 노출됩니다."
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
            onClick={handleSubmitClick}
            disabled={isPending}
            className="h-11 w-full"
          >
            공지 등록
          </Button>
        </FormActions>
      </PageShell>

      {isConfirmOpen && (
        <ConfirmModal
          title="공지 등록 확인"
          message="공지를 등록하면 모든 학생에게 공지됩니다. 정말 공지하시겠습니까?"
          confirmLabel="공지하기"
          pendingLabel="등록 중.."
          onConfirm={handleConfirm}
          onCancel={() => !isPending && setIsConfirmOpen(false)}
          isPending={isPending}
        />
      )}
    </>
  );
}
