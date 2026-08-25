"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import PageShell from "@/components/layout/PageShell";
import PageHeader from "@/components/layout/PageHeader";
import BackLink from "@/components/layout/BackLink";

const ConfirmModal = dynamic(() => import("@/components/common/ConfirmModal"), {
  ssr: false,
});
import useAuthStore from "@/stores/authStore";
import { useGetNotices, useDeleteNotice } from "@/entities/notice";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function NotificationPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useGetNotices();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const { mutate: deleteNotice, isPending: isDeleting } = useDeleteNotice({
    onSuccess: () => setDeleteTargetId(null),
    onError: () => setDeleteTargetId(null),
  });

  const notices = data?.content ?? [];
  const isAdmin = user?.role === "ADMIN";

  const handleConfirmDelete = () => {
    if (deleteTargetId === null) return;
    deleteNotice(deleteTargetId);
  };

  return (
    <>
      <PageShell>
        <BackLink href="/">이번 주 강연</BackLink>
        <PageHeader
          className="mt-5 pb-10"
          title="공지사항"
          description="학생회가 올린 안내입니다. 신청 기간과 운영 규칙은 여기에서 먼저 공지됩니다."
          actions={
            isAdmin && (
              <Link href="/notification/write">
                <Button className="w-fit px-5 py-2.5">공지 작성</Button>
              </Link>
            )
          }
        />

        {isLoading ? (
          <Spinner className="py-20" />
        ) : notices.length === 0 ? (
          <p className="rounded-2xl bg-surface px-6 py-20 text-center text-sm text-gray-500 shadow-e1">
            아직 올라온 공지가 없습니다.
          </p>
        ) : (
          /* 날짜를 왼쪽 레일에 두고 본문을 오른쪽으로 흘리는 기록형 목록 */
          <div className="flex flex-col gap-3">
            {notices.map((notice) => {
              const canEdit = user?.userId === notice.authorId || isAdmin;
              return (
                <article
                  key={notice.id}
                  className="grid gap-x-10 gap-y-3 rounded-2xl bg-surface p-6 shadow-e2 md:grid-cols-[160px_minmax(0,1fr)] md:p-8"
                >
                  <div className="flex flex-row items-baseline gap-3 md:flex-col md:gap-1.5">
                    <time className="tnum text-sm font-semibold text-gray-900">
                      {formatDate(notice.createdAt)}
                    </time>
                    <span className="text-xs text-gray-500">
                      {notice.authorName}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="break-words text-lg font-bold leading-snug text-gray-900">
                        {notice.title}
                      </h2>
                      {canEdit && (
                        <div className="flex shrink-0 items-center gap-1">
                          <Link
                            href={`/notification/${notice.id}/edit`}
                            className="focusable rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                          >
                            수정
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(notice.id)}
                            className="focusable rounded-lg px-2.5 py-1.5 text-xs font-semibold text-error transition-colors hover:bg-error-soft"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="max-w-[74ch] whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                      {notice.content}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </PageShell>

      {deleteTargetId !== null && (
        <ConfirmModal
          title="공지 삭제"
          message="공지를 삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?"
          confirmLabel="삭제"
          confirmVariant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTargetId(null)}
          isPending={isDeleting}
        />
      )}
    </>
  );
}
