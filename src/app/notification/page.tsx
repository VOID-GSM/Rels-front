"use client";

import { useState } from "react";
import Link from "next/link";
import Arrow from "@/assets/svg/Arrow";
import Button from "@/components/common/Button";
import useAuthStore from "@/stores/authStore";
import { useGetNotices, useDeleteNotice } from "@/entities/notice";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function DeleteConfirmModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-[360px] mx-4 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold text-gray-900">공지 삭제</h2>
          <p className="text-sm text-gray-500">
            공지를 삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="cancel" onClick={onCancel} className="py-2.5">
            취소
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="py-2.5 bg-error border-error hover:bg-error/90"
          >
            {isPending ? "삭제 중..." : "삭제"}
          </Button>
        </div>
      </div>
    </div>
  );
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
      <main className="max-w-[800px] mx-auto px-6 py-10 flex flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-gray-500 w-fit"
        >
          <Arrow />
          뒤로
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">공지 목록</h1>
          {isAdmin && (
            <Link href="/notification/write">
              <Button className="py-2 px-4 w-fit">공지 작성</Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
          </div>
        ) : notices.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-20">등록된 공지가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {notices.map((notice) => {
              const canEdit = user?.userId === notice.authorId || isAdmin;
              return (
                <div
                  key={notice.id}
                  className="border border-main-200 rounded-2xl p-6 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-base font-bold text-gray-900">{notice.title}</h2>
                      <span className="text-xs text-gray-400">{formatDate(notice.createdAt)}</span>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/notification/${notice.id}/edit`}
                          className="text-xs text-gray-500 border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50 transition-colors"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => setDeleteTargetId(notice.id)}
                          className="text-xs text-error border border-error rounded-md px-3 py-1 hover:bg-error/5 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {notice.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {deleteTargetId !== null && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTargetId(null)}
          isPending={isDeleting}
        />
      )}
    </>
  );
}
