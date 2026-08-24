"use client";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import CharCountTextArea from "@/components/common/CharCountTextArea";
import FormSection from "@/components/layout/FormSection";
import {
  LectureCardContent,
  LECTURE_CARD_SURFACE,
} from "@/components/lecture/LectureCard";
import { useLectureForm } from "./useLectureForm";
import {
  LECTURE_TITLE_MAX_LENGTH as TITLE_MAX_LENGTH,
  LECTURE_DESCRIPTION_MAX_LENGTH as DESCRIPTION_MAX_LENGTH,
} from "@/constants/lecture";
import type { LectureFormValues, LectureFormData } from "./types";

export type { LectureFormValues, LectureFormData };

interface LectureFormProps {
  initialValues?: Partial<LectureFormValues>;
  onSubmit: (data: LectureFormData) => void;
  isPending: boolean;
  submitLabel: string;
  extraAction?: React.ReactNode;
  forceCapacityMode?: "total" | "grade";
}

export default function LectureForm({
  initialValues,
  onSubmit,
  isPending,
  submitLabel,
  extraAction,
  forceCapacityMode,
}: LectureFormProps) {
  const {
    values,
    setters,
    errors,
    clearError,
    handleModeChange,
    validate,
    buildSubmitData,
  } = useLectureForm(initialValues, forceCapacityMode);

  const {
    title,
    description,
    capacityMode,
    totalCapacity,
    grade1,
    grade2,
    grade3,
    lectureLocation,
    lectureDate,
    lectureTime,
    applicationDeadline,
  } = values;

  const {
    setTitle,
    setDescription,
    setTotalCapacity,
    setGrade1,
    setGrade2,
    setGrade3,
    setLectureLocation,
    setLectureDate,
    setLectureTime,
    setApplicationDeadline,
  } = setters;

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(buildSubmitData());
  };

  const previewCapacity =
    capacityMode === "total"
      ? Number(totalCapacity) || 0
      : (Number(grade1) || 0) + (Number(grade2) || 0) + (Number(grade3) || 0);

  return (
    <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_296px] xl:gap-16">
      <div className="flex min-w-0 flex-col">
        <FormSection
          title="어떤 강연인가요"
          description="목록에서 가장 먼저 보이는 정보입니다. 무엇을 다루는지 한 줄로 알 수 있게 적어 주세요."
        >
          <div className="flex flex-col gap-1">
            <Input
              label="강연 제목"
              placeholder="예) React 렌더링 최적화 파헤치기"
              value={title}
              maxLength={TITLE_MAX_LENGTH}
              onChange={(e) => {
                setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH));
                clearError("title");
              }}
              error={errors.title}
            />
            <p className="tnum text-right text-xs text-gray-500">
              {title.length}/{TITLE_MAX_LENGTH}
            </p>
          </div>

          <CharCountTextArea
            label="강연 내용"
            placeholder="다룰 주제, 준비물, 미리 알아두면 좋은 것을 적어 주세요."
            value={description}
            maxLength={DESCRIPTION_MAX_LENGTH}
            rows={7}
            onChange={(v) => {
              setDescription(v);
              clearError("description");
            }}
            error={errors.description}
          />
        </FormSection>

        <FormSection
          title="몇 명까지 받나요"
          description="전체 인원으로 한 번에 정하거나, 학년별로 나눠서 정할 수 있습니다."
        >
          {!forceCapacityMode && (
            <div className="inline-flex w-fit gap-0.5 rounded-xl bg-gray-100 p-1">
              {(
                [
                  { key: "total", label: "전체 인원" },
                  { key: "grade", label: "학년별 인원" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleModeChange(key)}
                  className={`focusable rounded-lg px-3.5 py-1.5 text-sm font-medium transition-[background-color,box-shadow,color] ${
                    capacityMode === key
                      ? "bg-surface text-gray-900 shadow-e1"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {capacityMode === "total" ? (
            <div className="max-w-[240px]">
              <Input
                label="최대 인원"
                type="number"
                min={0}
                placeholder="예) 20"
                value={totalCapacity}
                onChange={(e) => {
                  setTotalCapacity(e.target.value);
                  clearError("totalCapacity");
                }}
                error={errors.totalCapacity}
              />
            </div>
          ) : (
            <div className="grid max-w-[420px] grid-cols-3 gap-3">
              <Input
                label="1학년"
                type="number"
                min={0}
                placeholder="인원"
                value={grade1}
                onChange={(e) => {
                  setGrade1(e.target.value);
                  clearError("grade1");
                }}
                error={errors.grade1}
              />
              <Input
                label="2학년"
                type="number"
                min={0}
                placeholder="인원"
                value={grade2}
                onChange={(e) => {
                  setGrade2(e.target.value);
                  clearError("grade2");
                }}
                error={errors.grade2}
              />
              <Input
                label="3학년"
                type="number"
                min={0}
                placeholder="인원"
                value={grade3}
                onChange={(e) => {
                  setGrade3(e.target.value);
                  clearError("grade3");
                }}
                error={errors.grade3}
              />
            </div>
          )}
        </FormSection>

        <FormSection
          title="언제 어디서 하나요"
          description="신청 마감일이 지나면 목록에서 지난 강연으로 넘어갑니다."
        >
          <Input
            label="강연 장소"
            placeholder="예) 컴플렉스존"
            value={lectureLocation}
            onChange={(e) => {
              setLectureLocation(e.target.value);
              clearError("lectureLocation");
            }}
            error={errors.lectureLocation}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="날짜"
              type="date"
              value={lectureDate}
              onChange={(e) => {
                setLectureDate(e.target.value);
                clearError("lectureDate");
              }}
              error={errors.lectureDate}
            />
            <Input
              label="시간"
              type="time"
              value={lectureTime}
              onChange={(e) => {
                setLectureTime(e.target.value);
                clearError("lectureTime");
              }}
              error={errors.lectureTime}
            />
          </div>

          <Input
            label="신청 마감일"
            type="datetime-local"
            value={applicationDeadline}
            onChange={(e) => {
              setApplicationDeadline(e.target.value);
              clearError("applicationDeadline");
            }}
            error={errors.applicationDeadline}
          />
        </FormSection>

        <div className="flex flex-wrap items-center gap-2.5 pt-6">
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-fit px-8 py-3.5"
          >
            {isPending ? `${submitLabel} 중` : submitLabel}
          </Button>
          {extraAction}
        </div>
      </div>

      {/* 입력하는 동안 목록에서 어떻게 보일지 옆에서 그대로 보여줍니다. */}
      <aside className="hidden xl:block">
        <div className="sticky top-[94px] flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-wide text-gray-600">
            강연 목록에서 이렇게 보입니다
          </p>
          <div className={LECTURE_CARD_SURFACE}>
            <LectureCardContent
              title={title || "강연 제목"}
              speaker="내가 개설"
              status="open"
              currentCount={0}
              maxCount={previewCapacity}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
