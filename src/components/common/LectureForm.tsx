"use client";

import { useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export interface LectureFormValues {
  title: string;
  description: string;
  capacityMode: "total" | "grade";
  totalCapacity: string;
  grade1: string;
  grade2: string;
  grade3: string;
  lectureLocation: string;
  lectureDate: string;
  lectureTime: string;
  applicationDeadline: string;
}

export interface LectureFormData {
  title: string;
  description: string;
  totalCapacity?: number | null;
  capacityByGrade?: { "1": number; "2": number; "3": number } | null;
  lectureLocation?: string | null;
  lectureDate?: string | null;
  lectureTime?: string | null;
  applicationDeadline?: string | null;
}

interface LectureFormProps {
  initialValues?: Partial<LectureFormValues>;
  onSubmit: (data: LectureFormData) => void;
  isPending: boolean;
  submitLabel: string;
  extraAction?: React.ReactNode;
  forceCapacityMode?: "total" | "grade";
}

const DEFAULT_VALUES: LectureFormValues = {
  title: "",
  description: "",
  capacityMode: "total",
  totalCapacity: "",
  grade1: "",
  grade2: "",
  grade3: "",
  lectureLocation: "",
  lectureDate: "",
  lectureTime: "",
  applicationDeadline: "",
};

export default function LectureForm({
  initialValues,
  onSubmit,
  isPending,
  submitLabel,
  extraAction,
  forceCapacityMode,
}: LectureFormProps) {
  const init = { ...DEFAULT_VALUES, ...initialValues };

  const [title, setTitle] = useState(init.title);
  const [description, setDescription] = useState(init.description);
  const [capacityMode, setCapacityMode] = useState<"total" | "grade">(
    forceCapacityMode ?? init.capacityMode,
  );
  const [totalCapacity, setTotalCapacity] = useState(init.totalCapacity);
  const [grade1, setGrade1] = useState(init.grade1);
  const [grade2, setGrade2] = useState(init.grade2);
  const [grade3, setGrade3] = useState(init.grade3);
  const [lectureLocation, setLectureLocation] = useState(init.lectureLocation);
  const [lectureDate, setLectureDate] = useState(init.lectureDate);
  const [lectureTime, setLectureTime] = useState(init.lectureTime);
  const [applicationDeadline, setApplicationDeadline] = useState(init.applicationDeadline);

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    totalCapacity?: string;
    grade1?: string;
    grade2?: string;
    grade3?: string;
  }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "강연 제목을 입력해주세요.";
    if (!description.trim()) next.description = "강연 내용을 입력해주세요.";
    if (capacityMode === "total") {
      if (totalCapacity === "" || isNaN(Number(totalCapacity)) || Number(totalCapacity) < 0)
        next.totalCapacity = "0명 이상이어야 합니다.";
    } else {
      if (grade1 === "" || isNaN(Number(grade1)) || Number(grade1) < 0) next.grade1 = "0명 이상이어야 합니다.";
      if (grade2 === "" || isNaN(Number(grade2)) || Number(grade2) < 0) next.grade2 = "0명 이상이어야 합니다.";
      if (grade3 === "" || isNaN(Number(grade3)) || Number(grade3) < 0) next.grade3 = "0명 이상이어야 합니다.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      ...(capacityMode === "total"
        ? { totalCapacity: Number(totalCapacity), capacityByGrade: null }
        : {
            totalCapacity: null,
            capacityByGrade: {
              "1": Number(grade1),
              "2": Number(grade2),
              "3": Number(grade3),
            },
          }),
      lectureLocation: lectureLocation.trim() || null,
      lectureDate: lectureDate || null,
      lectureTime: lectureTime || null,
      applicationDeadline: applicationDeadline || null,
    });
  };

  const handleModeChange = (mode: "total" | "grade") => {
    setCapacityMode(mode);
    setErrors({});
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="강연 제목"
        placeholder="강연 제목"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
        }}
        error={errors.title}
      />

      <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-medium text-gray-700">강연 내용</label>
        <textarea
          placeholder="강연 내용을 입력하세요"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((p) => ({ ...p, description: undefined }));
          }}
          rows={5}
          className={`w-full px-3 py-2 border rounded-md placeholder:text-gray-400 focus:outline-none transition-colors resize-none ${
            errors.description
              ? "border-error focus:border-error"
              : "border-main-300 focus:border-main"
          }`}
        />
        {errors.description && (
          <p className="text-xs text-error">{errors.description}</p>
        )}
      </div>

      {/* 인원 제한 방식 토글 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">인원 제한</label>
        {!forceCapacityMode && (
          <div className="flex rounded-lg border border-main-300 overflow-hidden w-fit">
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
              className={`px-4 py-2 text-sm font-medium transition-colors border-l border-main-300 ${
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
              if (errors.totalCapacity) setErrors((p) => ({ ...p, totalCapacity: undefined }));
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
                if (errors.grade1) setErrors((p) => ({ ...p, grade1: undefined }));
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
                if (errors.grade2) setErrors((p) => ({ ...p, grade2: undefined }));
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
                if (errors.grade3) setErrors((p) => ({ ...p, grade3: undefined }));
              }}
              error={errors.grade3}
            />
          </div>
        )}
      </div>

      {/* 강연 장소 */}
      <Input
        label="강연 장소 (선택)"
        placeholder="예: 공학관 301호"
        value={lectureLocation}
        onChange={(e) => setLectureLocation(e.target.value)}
      />

      {/* 날짜 / 시간 */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="날짜 (선택)"
          type="date"
          value={lectureDate}
          onChange={(e) => setLectureDate(e.target.value)}
        />
        <Input
          label="시간 (선택)"
          type="time"
          value={lectureTime}
          onChange={(e) => setLectureTime(e.target.value)}
        />
      </div>

      {/* 신청 마감일 */}
      <Input
        label="신청 마감일 (선택)"
        type="datetime-local"
        value={applicationDeadline}
        onChange={(e) => setApplicationDeadline(e.target.value)}
      />

      <div className="flex gap-3 mt-2">
        <Button onClick={handleSubmit} disabled={isPending} className="py-3">
          {isPending ? `${submitLabel} 중...` : submitLabel}
        </Button>
        {extraAction}
      </div>
    </div>
  );
}
