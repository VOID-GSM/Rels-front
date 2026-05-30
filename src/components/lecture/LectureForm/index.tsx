"use client";

import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import CharCountTextArea from "@/components/common/CharCountTextArea";
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Input
          label="강연 제목"
          placeholder="강연 제목"
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          onChange={(e) => {
            setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH));
            clearError("title");
          }}
          error={errors.title}
        />
        <p className="text-right text-xs text-gray-400">
          {title.length}/{TITLE_MAX_LENGTH}
        </p>
      </div>

      <CharCountTextArea
        label="강연 내용"
        placeholder="강연 내용을 입력해 주세요."
        value={description}
        maxLength={DESCRIPTION_MAX_LENGTH}
        onChange={(v) => {
          setDescription(v);
          clearError("description");
        }}
        error={errors.description}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">인원 제한</label>
        {!forceCapacityMode && (
          <div className="flex w-fit overflow-hidden rounded-lg border border-main-300">
            <button
              type="button"
              onClick={() => handleModeChange("total")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                capacityMode === "total"
                  ? "bg-main text-white"
                  : "bg-white text-gray-600 hover:bg-main-100"
              }`}
            >
              전체 인원
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("grade")}
              className={`border-l border-main-300 px-4 py-2 text-sm font-medium transition-colors ${
                capacityMode === "grade"
                  ? "bg-main text-white"
                  : "bg-white text-gray-600 hover:bg-main-100"
              }`}
            >
              학년별 인원
            </button>
          </div>
        )}

        {capacityMode === "total" ? (
          <Input
            label="최대 인원"
            type="number"
            min={0}
            placeholder="전체 최대 인원"
            value={totalCapacity}
            onChange={(e) => {
              setTotalCapacity(e.target.value);
              clearError("totalCapacity");
            }}
            error={errors.totalCapacity}
          />
        ) : (
          <div className="grid grid-cols-3 gap-3">
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
      </div>

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

      <div className="grid grid-cols-2 gap-3">
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

      <div className="mt-2 flex gap-3">
        <Button onClick={handleSubmit} disabled={isPending} className="py-3">
          {isPending ? `${submitLabel} 중..` : submitLabel}
        </Button>
        {extraAction}
      </div>
    </div>
  );
}
