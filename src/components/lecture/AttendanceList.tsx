"use client";

import { useMemo, useState } from "react";
import People from "@/assets/svg/People";
import Button from "@/components/common/Button";
import CopyApplicantsButton from "@/components/lecture/CopyApplicantsButton";
import { ATTENDANCE_STATUS_LABEL } from "@/constants/lecture";
import type {
  AttendanceStatusType,
  AttendanceUpdate,
  LectureAttendance,
} from "@/entities/lecture";

/**
 * 학생회가 보는 신청자 카드입니다. 목록은 ApplicantList와 같은 모양이고,
 * 줄마다 출석/결석 버튼이 붙습니다. 학생회가 아니면 ApplicantList가 대신 뜹니다.
 */
interface AttendanceListProps {
  currentCount: number;
  maxCount: number;
  attendances: LectureAttendance[];
  isLoading?: boolean;
  isError?: boolean;
  isSaving?: boolean;
  onSave: (updates: AttendanceUpdate[]) => void;
}

export default function AttendanceList({
  currentCount,
  maxCount,
  attendances,
  isLoading = false,
  isError = false,
  isSaving = false,
  onSave,
}: AttendanceListProps) {
  // 저장 전까지는 화면에서만 바뀝니다. 바뀐 인원만 담아 두었다가 한 번에 보냅니다.
  const [drafts, setDrafts] = useState<Record<number, AttendanceStatusType>>({});

  // 저장이 끝나 서버 값이 새로 오면 이미 반영된 초안은 저절로 빠집니다.
  // 상태를 되돌리는 대신 렌더할 때마다 "아직 서버와 다른 것"만 추려 씁니다.
  const pendingDrafts = useMemo(() => {
    const pending: Record<number, AttendanceStatusType> = {};

    for (const attendance of attendances) {
      const draft = drafts[attendance.userId];
      if (draft !== undefined && draft !== attendance.attendanceStatus) {
        pending[attendance.userId] = draft;
      }
    }

    return pending;
  }, [attendances, drafts]);

  const rows = useMemo(
    () =>
      attendances.map((attendance) => ({
        ...attendance,
        status: pendingDrafts[attendance.userId] ?? attendance.attendanceStatus,
      })),
    [attendances, pendingDrafts],
  );

  const attendedCount = rows.filter((r) => r.status === "ATTENDED").length;
  const absentCount = rows.filter((r) => r.status === "ABSENT").length;
  const pendingCount = rows.length - attendedCount - absentCount;
  const changedCount = Object.keys(pendingDrafts).length;

  const setStatus = (userId: number, next: AttendanceStatusType) => {
    setDrafts((prev) => {
      const saved =
        attendances.find((a) => a.userId === userId)?.attendanceStatus ?? "NONE";
      const rest = { ...prev };
      delete rest[userId];

      // 서버 값으로 되돌아온 항목은 보낼 필요가 없으니 초안에서 뺍니다.
      if (next === saved) return rest;
      return { ...rest, [userId]: next };
    });
  };

  // 같은 버튼을 다시 누르면 미확인으로 되돌립니다. 잘못 찍었을 때의 탈출구입니다.
  const toggleStatus = (
    userId: number,
    current: AttendanceStatusType,
    next: AttendanceStatusType,
  ) => setStatus(userId, current === next ? "NONE" : next);

  const markRestAttended = () => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const row of rows) {
        if (row.status !== "NONE") continue;
        if (row.attendanceStatus === "ATTENDED") delete next[row.userId];
        else next[row.userId] = "ATTENDED";
      }
      return next;
    });
  };

  const handleSave = () => {
    const updates: AttendanceUpdate[] = Object.entries(pendingDrafts).map(
      ([userId, attendanceStatus]) => ({
        userId: Number(userId),
        attendanceStatus,
      }),
    );

    if (updates.length === 0) return;
    onSave(updates);
  };

  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl bg-surface p-5 shadow-e2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-main">
          <People />
        </span>
        <h2 className="text-sm font-bold text-gray-900">신청자</h2>
        <span className="tnum text-sm text-gray-500">
          {currentCount}/{maxCount}
        </span>
        {rows.length > 0 && (
          <>
            <span className="tnum ml-auto text-xs text-gray-500">
              출석 {attendedCount} · 결석 {absentCount} · 미확인 {pendingCount}
            </span>
            <CopyApplicantsButton applicants={rows} />
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[52px] animate-pulse rounded-xl bg-gray-50"
            />
          ))}
        </div>
      ) : isError ? (
        // 백엔드가 권한 없는 계정에도 403을 주므로, 빈 목록과 구분해서 알립니다.
        <p className="py-6 text-center text-xs text-gray-500">
          출석부를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-500">
          아직 신청자가 없습니다.
        </p>
      ) : (
        <>
          <ul className="scrollbar-hide flex max-h-[320px] flex-col gap-1.5 overflow-y-auto">
            {rows.map((row, index) => {
              const isAttended = row.status === "ATTENDED";
              const isAbsent = row.status === "ABSENT";
              const struckThrough = isAttended
                ? "text-gray-400 line-through decoration-gray-400"
                : "";

              return (
                <li
                  key={row.userId}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
                    isAttended ? "bg-gray-100" : "bg-gray-50"
                  }`}
                >
                  <span className="tnum w-4 shrink-0 text-xs font-semibold text-gray-500">
                    {index + 1}
                  </span>

                  {/* 출석 처리된 줄은 취소선을 긋고 회색으로 눌러, 아직 안 부른
                      사람만 검게 남게 합니다. */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span
                      className={`truncate text-sm font-semibold ${
                        struckThrough || "text-gray-900"
                      }`}
                    >
                      {row.name}
                    </span>
                    <span
                      className={`tnum text-xs ${struckThrough || "text-gray-600"}`}
                    >
                      {row.studentNumber}
                      {isAbsent && (
                        <span className="ml-1.5 font-semibold text-error">
                          {ATTENDANCE_STATUS_LABEL.ABSENT}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-pressed={isAttended}
                      onClick={() =>
                        toggleStatus(row.userId, row.status, "ATTENDED")
                      }
                      className={`focusable cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                        isAttended
                          ? "bg-main text-gray-900"
                          : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                      }`}
                    >
                      {ATTENDANCE_STATUS_LABEL.ATTENDED}
                    </button>
                    <button
                      type="button"
                      aria-pressed={isAbsent}
                      onClick={() =>
                        toggleStatus(row.userId, row.status, "ABSENT")
                      }
                      className={`focusable cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                        isAbsent
                          ? "bg-error text-white"
                          : "text-gray-600 hover:bg-error-soft hover:text-error"
                      }`}
                    >
                      {ATTENDANCE_STATUS_LABEL.ABSENT}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">
              {changedCount > 0
                ? `저장하지 않은 변경 ${changedCount}명`
                : "변경한 내용이 없습니다."}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={markRestAttended}
                  className="focusable cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  남은 {pendingCount}명 모두 출석
                </button>
              )}
              {changedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setDrafts({})}
                  disabled={isSaving}
                  className="focusable cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  되돌리기
                </button>
              )}
              <Button
                onClick={handleSave}
                disabled={changedCount === 0 || isSaving}
                className="ml-auto px-3.5 py-2 text-xs"
              >
                {isSaving ? "저장하는 중" : "출석 저장"}
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
