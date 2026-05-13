"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import ApplicantList from "@/components/common/ApplicantList";
import Arrow from "@/assets/svg/Arrow";
import Pencil from "@/assets/svg/Pencil";
import People from "@/assets/svg/People";
import Calendar from "@/assets/svg/Calendar";
import Clock from "@/assets/svg/Clock";
import Location from "@/assets/svg/Location";
import DeadlineCountdown from "@/components/common/DeadlineCountdown";
import useAuthStore from "@/stores/authStore";
import { authUrls } from "@/shared/api/apiUrls";
import {
  getDisplayLectureStatus,
  useGetLecture,
  useEnrollLecture,
  useCancelEnrollment,
  useGetEnrollments,
} from "@/entities/lecture";

export default function LectureDetailPage() {
  const params = useParams();
  const lectureId = Number(params.lectureId);
  const { user, initFromSession } = useAuthStore();

  useEffect(() => {
    const token = initFromSession();
    if (!token) {
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/callback`;
      window.location.href = authUrls.dgStart(redirectUri);
    }
  }, [initFromSession]);

  const { data: lecture, isLoading } = useGetLecture(lectureId);
  const { data: enrollments } = useGetEnrollments(lectureId);

  const [enrollResult, setEnrollResult] = useState<
    "ENROLLED" | "WAITING" | "ERROR" | null
  >(null);

  const { mutate: enrollLecture, isPending: isEnrolling } = useEnrollLecture(
    lectureId,
    {
      onSuccess: (data) => setEnrollResult(data.enrollmentStatus),
      onError: () => setEnrollResult("ERROR"),
    },
  );
  const { mutate: cancelEnrollment, isPending: isCancelling } =
    useCancelEnrollment(lectureId, {
      onSuccess: () => setEnrollResult(null),
      onError: () => setEnrollResult("ERROR"),
    });

  const enrollStatus = useMemo<"ENROLLED" | "WAITING" | null>(() => {
    if (enrollResult === "ENROLLED" || enrollResult === "WAITING")
      return enrollResult;
    if (enrollResult === "ERROR") return null;
    if (!enrollments || !user) return null;
    if (enrollments.enrolled.some((a) => a.userId === user.userId))
      return "ENROLLED";
    if (enrollments.waiting.some((a) => a.userId === user.userId))
      return "WAITING";
    return null;
  }, [enrollResult, enrollments, user]);

  if (isNaN(lectureId)) return notFound();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
        <div className="w-8 h-8 border-2 border-main/30 border-t-main rounded-full animate-spin" />
      </div>
    );
  }

  if (!lecture) return notFound();

  const isCreator = user?.userId === lecture.creatorId;
  const isAdmin = user?.role === "ADMIN";
  const showPencil = isCreator || isAdmin;

  const totalCapacity =
    lecture.totalCapacity ??
    ((lecture.capacityByGrade?.["1"] ?? 0) +
      (lecture.capacityByGrade?.["2"] ?? 0) +
      (lecture.capacityByGrade?.["3"] ?? 0));
  const usesGradeCapacity =
    lecture.totalCapacity == null && lecture.capacityByGrade != null;

  const isFull = lecture.enrolledCount >= totalCapacity;
  const displayStatus = getDisplayLectureStatus(lecture);

  const STATUS_TO_BADGE = {
    OPEN: "open",
    CONFIRMED: "confirmed",
    CLOSED: "closed",
    UNCONFIRMED: "unconfirmed",
  } as const;

  const badgeVariant = STATUS_TO_BADGE[displayStatus];

  return (
    <main className="max-w-[800px] mx-auto px-6 py-10 flex flex-col gap-6">
      <Link
        href="/"
        className="flex items-center gap-1 text-sm text-gray-500 w-fit"
      >
        <Arrow />
        뒤로
      </Link>

      {/* 강연 정보 카드 */}
      <div className="border border-main-200 rounded-2xl p-6 flex flex-col gap-4">
        {/* 상단: 뱃지 + 아이콘 */}
        <div className="flex items-center justify-between">
          <Badge variant={badgeVariant} />
          {showPencil && (
            <Link
              href={`/lectures/${lectureId}/edit`}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Pencil />
            </Link>
          )}
        </div>

        {/* 제목 */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{lecture.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{lecture.creatorName}</p>
        </div>

        {/* 설명 */}
        <p className="text-sm text-gray-700 leading-relaxed">
          {lecture.description}
        </p>

        {/* 인원 정보 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <People />
            <span>
              전체 {lecture.enrolledCount}/{totalCapacity}명
            </span>
          </div>
          {usesGradeCapacity && (
            <div className="flex items-center gap-3 text-xs text-gray-400 pl-5">
              {(["1", "2", "3"] as const).map((grade) => (
                <span key={grade}>
                  {grade}학년 최대 {lecture.capacityByGrade![grade] ?? 0}명
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 강연 정보 (장소/날짜/시간) */}
        {(lecture.lectureLocation ||
          lecture.lectureDate ||
          lecture.lectureTime) && (
          <div className="flex items-center gap-4 bg-main-100 rounded-xl px-4 py-2.5 text-xs text-gray-600 flex-wrap">
            {lecture.lectureLocation && (
              <div className="flex items-center gap-1.5">
                <Location />
                <span>{lecture.lectureLocation}</span>
              </div>
            )}
            {lecture.lectureDate && (
              <div className="flex items-center gap-1.5">
                <Calendar />
                <span>{lecture.lectureDate}</span>
              </div>
            )}
            {lecture.lectureTime && (
              <div className="flex items-center gap-1.5">
                <Clock />
                <span>{lecture.lectureTime}</span>
              </div>
            )}
          </div>
        )}

        {/* 신청 마감 카운트다운 */}
        {lecture.applicationDeadline && displayStatus !== "CLOSED" && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>신청 마감까지</span>
            <DeadlineCountdown deadline={lecture.applicationDeadline} />
          </div>
        )}

        {/* 액션 버튼 */}
        {isCreator ? (
          <Button variant="waiting" disabled className="py-3 mt-2">
            내가 생성한 강연입니다
          </Button>
        ) : displayStatus === "CLOSED" || displayStatus === "UNCONFIRMED" ? (
          <Button
            variant={displayStatus === "CLOSED" ? "cancel" : "waiting"}
            disabled
            className="py-3 mt-2"
          >
            {displayStatus === "UNCONFIRMED" ? "개설 불확정" : "강연 종료"}
          </Button>
        ) : enrollStatus === "ENROLLED" ? (
          <Button
            variant="cancel"
            onClick={() => cancelEnrollment()}
            disabled={isCancelling}
            className="py-3 mt-2"
          >
            {isCancelling ? "취소 중..." : "신청 취소"}
          </Button>
        ) : enrollStatus === "WAITING" ? (
          <Button
            variant="cancel"
            onClick={() => cancelEnrollment()}
            disabled={isCancelling}
            className="py-3 mt-2"
          >
            {isCancelling ? "취소 중..." : "대기 취소"}
          </Button>
        ) : (
          <Button
            variant={isFull ? "waiting" : "primary"}
            onClick={() => enrollLecture()}
            disabled={isEnrolling}
            className="py-3 mt-2"
          >
            {isEnrolling ? "신청 중..." : isFull ? "대기 신청" : "신청하기"}
          </Button>
        )}
        {enrollResult === "ERROR" && (
          <p className="text-sm text-center text-red-500 font-medium">
            신청에 실패했습니다. 다시 시도해주세요.
          </p>
        )}
      </div>

      {/* 신청 현황 / 대기 현황 */}
      <div className="grid grid-cols-2 gap-4">
        <ApplicantList
          type="applicant"
          currentCount={lecture.enrolledCount}
          maxCount={totalCapacity}
          applicants={enrollments?.enrolled ?? []}
        />
        <ApplicantList
          type="waiting"
          waitingCount={lecture.waitingCount}
          applicants={enrollments?.waiting ?? []}
        />
      </div>
    </main>
  );
}
