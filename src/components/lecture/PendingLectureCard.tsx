"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Pencil from "@/assets/svg/Pencil";
import LectureForm from "@/components/lecture/LectureForm";
import type { LectureFormData } from "@/components/lecture/LectureForm";
import { useUpdateLecture } from "@/entities/lecture";
import type { LectureType } from "@/entities/lecture";
import {
  formatLectureDate,
  formatLectureTime,
  formatLectureDeadline,
} from "@/shared/lib/formatLectureSchedule";
import { formatServerDate } from "@/shared/lib/serverDateTime";
import {
  getEnrollmentOpenAt,
  formatEnrollmentOpenAt,
} from "@/shared/lib/enrollmentWindow";
import { GRADE_KEYS } from "@/shared/lib/gradeCapacity";

/** 개설자가 비워 둔 항목도 학생회가 알아볼 수 있게 자리를 남깁니다. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd
        className={`tnum text-sm ${value ? "text-gray-900" : "text-gray-400"}`}
      >
        {value || "미입력"}
      </dd>
    </div>
  );
}

const capacityText = (lecture: LectureType) => {
  if (lecture.totalCapacity != null) return `전체 ${lecture.totalCapacity}명`;
  if (!lecture.capacityByGrade) return "";

  const byGrade = GRADE_KEYS.map(
    (grade) => `${grade}학년 ${lecture.capacityByGrade![grade] ?? 0}명`,
  ).join(" · ");
  const sum = GRADE_KEYS.reduce(
    (acc, grade) => acc + (lecture.capacityByGrade![grade] ?? 0),
    0,
  );

  return `${byGrade} (합 ${sum}명)`;
};

interface PendingLectureCardProps {
  lecture: LectureType;
  onApprove: () => void;
  onReject: (rejectionReason: string) => void;
  /** 수락/거절 요청이 도는 동안은 카드 전체를 잠급니다. */
  isProcessing: boolean;
}

export default function PendingLectureCard({
  lecture,
  onApprove,
  onReject,
  isProcessing,
}: PendingLectureCardProps) {
  // 한 카드에서 판단과 수정이 모두 일어나서, 지금 무엇을 하는 중인지로 나눕니다.
  const [mode, setMode] = useState<"view" | "reject" | "edit">("view");
  const [rejectionReason, setRejectionReason] = useState("");

  const { mutate: updateLecture, isPending: isSaving } = useUpdateLecture(
    lecture.lectureId,
  );

  const enrollmentOpenAt = getEnrollmentOpenAt(lecture.createdAt);
  const scheduleText = [
    formatLectureDate(lecture.lectureDate),
    formatLectureTime(lecture.lectureTime),
  ]
    .filter(Boolean)
    .join(" ");

  const startRejecting = () => {
    setRejectionReason("");
    setMode("reject");
  };

  const handleSave = (data: LectureFormData) => {
    updateLecture(data, {
      onSuccess: () => {
        setMode("view");
        toast.success("강연을 수정했습니다.");
      },
      onError: () =>
        toast.error("수정하지 못했습니다. 잠시 후 다시 시도해 주세요."),
    });
  };

  return (
    <article className="grid gap-x-10 gap-y-3 rounded-2xl bg-surface p-6 shadow-e2 md:grid-cols-[160px_minmax(0,1fr)] md:p-8">
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

      <div className="flex min-w-0 flex-col gap-4">
        {mode === "edit" ? (
          <LectureForm
            initialValues={{
              title: lecture.title,
              description: lecture.description,
              capacityMode: lecture.totalCapacity != null ? "total" : "grade",
              totalCapacity: String(lecture.totalCapacity ?? ""),
              grade1: String(lecture.capacityByGrade?.["1"] ?? ""),
              grade2: String(lecture.capacityByGrade?.["2"] ?? ""),
              grade3: String(lecture.capacityByGrade?.["3"] ?? ""),
              lectureLocation: lecture.lectureLocation ?? "",
              lectureDate: lecture.lectureDate ?? "",
              lectureTime: lecture.lectureTime ?? "",
              applicationDeadline: lecture.applicationDeadline ?? "",
            }}
            onSubmit={handleSave}
            isPending={isSaving}
            submitLabel="저장"
            createdAt={lecture.createdAt}
            extraAction={
              <Button
                variant="cancel"
                onClick={() => setMode("view")}
                disabled={isSaving}
                className="h-11 w-fit px-7"
              >
                취소
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <Link
                href={`/lectures/${lecture.lectureId}`}
                className="focusable break-words rounded-lg text-lg font-bold leading-snug text-gray-900 underline-offset-4 hover:underline"
              >
                {lecture.title}
              </Link>
              {/* 판단 전에 잘못된 값을 고칠 수 있어야 해서 같은 카드에 둡니다. */}
              <button
                type="button"
                onClick={() => setMode("edit")}
                disabled={isProcessing}
                className="focusable inline-flex cursor-pointer items-center gap-1.5 rounded-lg text-xs font-semibold text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <Pencil />
                수정
              </button>
            </div>

            {/* 개설자가 입력한 항목을 빠짐없이 펼쳐 둡니다. 상세로 넘어가지
              않고도 정원과 마감까지 보고 판단할 수 있게. */}
            <dl className="grid gap-x-8 gap-y-4 rounded-xl bg-gray-50 px-5 py-4 sm:grid-cols-2">
              <DetailRow label="강연 일시" value={scheduleText} />
              <DetailRow
                label="강연 장소"
                value={lecture.lectureLocation ?? ""}
              />
              <DetailRow label="정원" value={capacityText(lecture)} />
              <DetailRow
                label="신청 마감"
                value={formatLectureDeadline(lecture.applicationDeadline)}
              />
              <DetailRow
                label="신청 시작 (자동)"
                value={
                  enrollmentOpenAt
                    ? formatEnrollmentOpenAt(enrollmentOpenAt)
                    : ""
                }
              />
            </dl>

            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
              {lecture.description}
            </p>

            {mode === "reject" ? (
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
                    onClick={() => onReject(rejectionReason)}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm"
                  >
                    {isProcessing ? "거절하는 중" : "거절하기"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setMode("view")}
                    disabled={isProcessing}
                    className="focusable cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={onApprove}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm"
                >
                  수락
                </Button>
                <Button
                  variant="cancel"
                  onClick={startRejecting}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm"
                >
                  거절
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}
