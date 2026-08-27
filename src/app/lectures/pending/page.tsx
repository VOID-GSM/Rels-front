"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Spinner from "@/components/common/Spinner";
import PageShell from "@/components/layout/PageShell";
import PageHeader from "@/components/layout/PageHeader";
import BackLink from "@/components/layout/BackLink";
import PendingLectureCard from "@/components/lecture/PendingLectureCard";
import useAuthStore from "@/stores/authStore";
import {
  useGetPendingLectures,
  useUpdateLectureApproval,
} from "@/entities/lecture";

export default function PendingLecturesPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  // 어느 카드의 버튼을 잠글지 알아야 해서, 처리 중인 강연을 따로 붙듭니다.
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { data: lectures, isLoading } = useGetPendingLectures({
    enabled: isAdmin,
  });

  const { mutate: updateApproval } = useUpdateLectureApproval({
    onSuccess: ({ approvalStatus }) => {
      setProcessingId(null);
      toast.success(
        approvalStatus === "APPROVED"
          ? "수락했습니다. 이제 학생들에게 보입니다."
          : "거절했습니다.",
      );
    },
    onError: () => {
      setProcessingId(null);
      toast.error("처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    },
  });

  useEffect(() => {
    if (isLoggedIn && user && user.role !== "ADMIN") {
      router.replace("/lectures");
    }
  }, [isLoggedIn, user, router]);

  if (!user || isLoading) return <Spinner />;
  if (!isAdmin) return null;

  const pending = lectures ?? [];

  const approve = (lectureId: number) => {
    setProcessingId(lectureId);
    updateApproval({ lectureId, approvalStatus: "APPROVED" });
  };

  const reject = (lectureId: number, rejectionReason: string) => {
    setProcessingId(lectureId);
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
        description="학생이 개설한 강연입니다. 개설자가 적은 내용을 그대로 펼쳐 두었으니, 고칠 곳이 있으면 수정한 뒤 판단해 주세요. 수락해야 학생들의 강연 목록에 나타납니다."
      />

      {pending.length === 0 ? (
        <p className="rounded-2xl bg-surface px-6 py-20 text-center text-sm text-gray-500 shadow-e1">
          승인을 기다리는 강연이 없습니다.
        </p>
      ) : (
        /* 공지 목록과 같은 골격: 왼쪽에 개설자, 오른쪽에 강연 내용과 판단 버튼 */
        <div className="flex flex-col gap-3">
          {pending.map((lecture) => (
            <PendingLectureCard
              key={lecture.lectureId}
              lecture={lecture}
              onApprove={() => approve(lecture.lectureId)}
              onReject={(reason) => reject(lecture.lectureId, reason)}
              isProcessing={processingId === lecture.lectureId}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
