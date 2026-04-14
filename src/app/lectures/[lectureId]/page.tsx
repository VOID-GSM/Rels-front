"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import ApplicantList from "@/components/common/ApplicantList";
import Input from "@/components/common/Input";
import Arrow from "@/assets/svg/Arrow";
import Pencil from "@/assets/svg/Pencil";
import Setting from "@/assets/svg/Setting";
import People from "@/assets/svg/People";
import Calendar from "@/assets/svg/Calendar";
import Clock from "@/assets/svg/Clock";
import useAuthStore from "@/stores/authStore";
import {
  useGetLecture,
  useUpdateLecture,
  type LectureStatusType,
} from "@/entities/lecture";

const STATUS_TO_BADGE: Record<
  LectureStatusType,
  "confirmed" | "pending" | "closed"
> = {
  OPEN: "confirmed",
  PENDING: "pending",
  CLOSED: "closed",
};

export default function LectureDetailPage() {
  const params = useParams();
  const lectureId = Number(params.lectureId);
  const { user } = useAuthStore();

  const { data: lecture, isLoading } = useGetLecture(lectureId);
  const { mutate: updateLecture, isPending: isUpdating } =
    useUpdateLecture(lectureId);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    maxCount: "",
    lectureLocation: "",
    lectureDate: "",
    lectureTime: "",
  });

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
  const showSettings = isAdmin;

  const isFull =
    lecture.maxCount !== null && lecture.enrolledCount >= lecture.maxCount;

  const handleOpenSettings = () => {
    setSettingsForm({
      maxCount: lecture.maxCount !== null ? String(lecture.maxCount) : "",
      lectureLocation: lecture.lectureLocation ?? "",
      lectureDate: lecture.lectureDate ?? "",
      lectureTime: lecture.lectureTime ?? "",
    });
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    setIsSettingsOpen(false);
    updateLecture({
      maxCount: settingsForm.maxCount
        ? Number(settingsForm.maxCount)
        : undefined,
      lectureLocation: settingsForm.lectureLocation || undefined,
      lectureDate: settingsForm.lectureDate || undefined,
      lectureTime: settingsForm.lectureTime || undefined,
    });
  };

  const handleEnroll = () => {
    // 강연 신청 API 연결 예정
    console.log(isFull ? "대기 신청:" : "신청:", lectureId);
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

        {/* 강연 정보 카드 */}
        <div className="border border-main-200 rounded-2xl p-6 flex flex-col gap-4">
          {/* 상단: 뱃지 + 아이콘 */}
          <div className="flex items-center justify-between">
            <Badge variant={STATUS_TO_BADGE[lecture.lectureStatus]} />
            <div className="flex items-center gap-2">
              {showPencil && (
                <Link
                  href={`/lectures/${lectureId}/edit`}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Pencil />
                </Link>
              )}
              {showSettings && (
                <button
                  onClick={handleOpenSettings}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Setting />
                </button>
              )}
            </div>
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
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <People />
            <span>
              {lecture.maxCount
                ? `${lecture.enrolledCount}/${lecture.maxCount}명`
                : `${lecture.enrolledCount}명`}
            </span>
          </div>

          {/* 강연 정보 (장소/날짜/시간) */}
          {(lecture.lectureLocation ||
            lecture.lectureDate ||
            lecture.lectureTime) && (
            <div className="flex items-center gap-4 bg-main-100 rounded-xl px-4 py-2.5 text-xs text-gray-600 flex-wrap">
              {lecture.lectureLocation && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1.5C6.27 1.5 4.875 2.895 4.875 4.625C4.875 7.125 8 12 8 12C8 12 11.125 7.125 11.125 4.625C11.125 2.895 9.73 1.5 8 1.5ZM8 6C7.17 6 6.5 5.33 6.5 4.5C6.5 3.67 7.17 3 8 3C8.83 3 9.5 3.67 9.5 4.5C9.5 5.33 8.83 6 8 6Z" fill="var(--color-gray-600)"/>
                  </svg>
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

          {/* 액션 버튼 */}
          {isCreator ? (
            <Button variant="waiting" disabled className="py-3 mt-2">
              내가 생성한 강연입니다
            </Button>
          ) : lecture.lectureStatus === "CLOSED" ? (
            <Button disabled className="py-3 mt-2">
              강연 종료
            </Button>
          ) : (
            <Button
              variant={isFull ? "waiting" : "primary"}
              onClick={handleEnroll}
              className="py-3 mt-2"
            >
              {isFull ? "대기 신청" : "신청하기"}
            </Button>
          )}
        </div>

        {/* 신청 현황 / 대기 현황 */}
        <div className="grid grid-cols-2 gap-4">
          <ApplicantList
            type="applicant"
            currentCount={lecture.enrolledCount}
            maxCount={lecture.maxCount ?? 0}
            applicants={[]}
            // 신청자 목록 API 연결 예정
          />
          <ApplicantList
            type="waiting"
            waitingCount={lecture.waitingCount}
            applicants={[]}
            // 대기자 목록 API 연결 예정
          />
        </div>
      </main>

      {/* 강연 설정 모달 */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-[480px] mx-4 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">강연 설정</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  최대 인원, 장소, 일정을 설정합니다.
                </p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* 최대 인원 */}
              <div className="flex flex-col gap-1">
                <Input
                  label="최대 인원"
                  type="number"
                  min={1}
                  value={settingsForm.maxCount}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      maxCount: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-400">
                  현재: {lecture.enrolledCount}명 신청 / {lecture.waitingCount}
                  명 대기
                </p>
              </div>

              <Input
                label="강연 장소"
                placeholder="예: 공학관 301호"
                value={settingsForm.lectureLocation}
                onChange={(e) =>
                  setSettingsForm((prev) => ({
                    ...prev,
                    lectureLocation: e.target.value,
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="날짜"
                  type="date"
                  value={settingsForm.lectureDate}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      lectureDate: e.target.value,
                    }))
                  }
                />
                <Input
                  label="시간"
                  type="time"
                  value={settingsForm.lectureTime}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      lectureTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <Button
                variant="cancel"
                onClick={() => setIsSettingsOpen(false)}
                className="py-2.5"
              >
                취소
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={isUpdating}
                className="py-2.5"
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
