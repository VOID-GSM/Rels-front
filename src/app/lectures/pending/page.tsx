"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Spinner from "@/components/common/Spinner";
import PageShell from "@/components/layout/PageShell";
import PageHeader from "@/components/layout/PageHeader";
import BackLink from "@/components/layout/BackLink";
import useAuthStore from "@/stores/authStore";
import {
  useGetPendingLectures,
  useUpdateLectureApproval,
} from "@/entities/lecture";
import {
  formatLectureDate,
  formatLectureTime,
} from "@/shared/lib/formatLectureSchedule";
import { formatServerDate } from "@/shared/lib/serverDateTime";

export default function PendingLecturesPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  // 거절은 사유를 받을 수 있어서, 누른 강연만 입력칸을 폅니다.
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: lectures, isLoading } = useGetPendingLectures({
    enabled: isAdmin,
  });

  const { mutate: updateApproval, isPending } = useUpdateLectureApproval({
    onSuccess: ({ approvalStatus }) => {
      setRejectingId(null);
      setRejectionReason("");
      toast.success(
        approvalStatus === "APPROVED"
          ? "수락했습니다. 이제 학생들에게 보입니다."
          : "거절했습니다.",
      );
    },
    onError: () =>
      toast.error("처리하지 못했습니다. 잠시 후 다시 시도해 주세요."),
  });

  useEffect(() => {
    if (isLoggedIn && user && user.role !== "ADMIN") {
      router.replace("/lectures");
    }
  }, [isLoggedIn, user, router]);

  if (!user || isLoading) return <Spinner />;
  if (!isAdmin) return null;

  const pending = lectures ?? [];

  const startRejecting = (lectureId: number) => {
    setRejectingId(lectureId);
    setRejectionReason("");
  };

  const confirmReject = (lectureId: number) => {
    updateApproval({
      lectureId,
      approvalStatus: "REJECTED",
      rejectionReason: rejectionReason.trim() || undefined,
    });
  };

  return (
    <PageShell>
      <BackLink href="/lectures">전체 강연</BackLink>
      <PageHeader
        className="mt-5 pb-10"
        title="강연 승인"
        description="학생이 개설한 강연입니다. 수락해야 학생들의 강연 목록에 나타납니다. 지금 정하지 않고 그대로 두면 계속 이 목록에 남습니다."
      />

      {pending.length === 0 ? (
        <p className="rounded-2xl bg-surface px-6 py-20 text-center text-sm text-gray-500 shadow-e1">
          승인을 기다리는 강연이 없습니다.
        </p>
      ) : (
        /* 공지 목록과 같은 골격: 왼쪽에 개설자, 오른쪽에 강연 내용과 판단 버튼 */
        <div className="flex flex-col gap-3">
          {pending.map((lecture) => {
            const scheduleText = [
              formatLectureDate(lecture.lectureDate),
              formatLectureTime(lecture.lectureTime),
              lecture.lectureLocation ?? "",
            ]
              .filter(Boolean)
              .join(" · ");
            const isRejecting = rejectingId === lecture.lectureId;

            return (
              <article
                key={lecture.lectureId}
                className="grid gap-x-10 gap-y-3 rounded-2xl bg-surface p-6 shadow-e2 md:grid-cols-[160px_minmax(0,1fr)] md:p-8"
              >
                <div className="flex flex-row items-baseline gap-3 md:flex-col md:gap-1.5">
                  <span className="text-sm font-semibold text-gray-900">
                    {lecture.creatorName}
                  </span>
                  <span className="tnum text-xs text-gray-500">
                    {lecture.creatorStudentNumber}
                  </span>
                  <span className="tnum text-xs text-gray-500 md:mt-1">
                    {formatServerDate(lecture.createdAt)} 개설
                  </span>
                </div>

                <div className="flex min-w-0 flex-col gap-3">
                  <Link
                    href={`/lectures/${lecture.lectureId}`}
                    className="focusable break-words rounded-lg text-lg font-bold leading-snug text-gray-900 underline-offset-4 hover:underline"
                  >
                    {lecture.title}
                  </Link>

                  {scheduleText && (
                    <p className="text-sm text-gray-600">{scheduleText}</p>
                  )}

                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                    {lecture.description}
                  </p>

                  {isRejecting ? (
                    <div className="flex flex-col gap-2.5">
                      <Input
                        label="거절 사유 (선택)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="개설자에게 전달할 사유를 적어 주세요."
                        autoFocus
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="danger"
                          onClick={() => confirmReject(lecture.lectureId)}
                          disabled={isPending}
                          className="px-4 py-2 text-sm"
                        >
                          {isPending ? "거절하는 중" : "거절하기"}
                        </Button>
                        <button
                          type="button"
                          onClick={() => setRejectingId(null)}
                          disabled={isPending}
                          className="focusable cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() =>
                          updateApproval({
                            lectureId: lecture.lectureId,
                            approvalStatus: "APPROVED",
                          })
                        }
                        disabled={isPending}
                        className="px-4 py-2 text-sm"
                      >
                        수락
                      </Button>
                      <Button
                        variant="cancel"
                        onClick={() => startRejecting(lecture.lectureId)}
                        disabled={isPending}
                        className="px-4 py-2 text-sm"
                      >
                        거절
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
