"use client";

import { useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export interface LectureFormValues {
  title: string;
  description: string;
  grade1: string;
  grade2: string;
  grade3: string;
  lectureLocation: string;
  lectureDate: string;
  lectureTime: string;
}

export interface LectureFormData {
  title: string;
  description: string;
  gradeCapacities: { "1": number; "2": number; "3": number };
  lectureLocation?: string;
  lectureDate?: string;
  lectureTime?: string;
}

interface LectureFormProps {
  initialValues?: Partial<LectureFormValues>;
  onSubmit: (data: LectureFormData) => void;
  isPending: boolean;
  submitLabel: string;
  extraAction?: React.ReactNode;
}

const DEFAULT_VALUES: LectureFormValues = {
  title: "",
  description: "",
  grade1: "",
  grade2: "",
  grade3: "",
  lectureLocation: "",
  lectureDate: "",
  lectureTime: "",
};

export default function LectureForm({
  initialValues,
  onSubmit,
  isPending,
  submitLabel,
  extraAction,
}: LectureFormProps) {
  const init = { ...DEFAULT_VALUES, ...initialValues };

  const [title, setTitle] = useState(init.title);
  const [description, setDescription] = useState(init.description);
  const [grade1, setGrade1] = useState(init.grade1);
  const [grade2, setGrade2] = useState(init.grade2);
  const [grade3, setGrade3] = useState(init.grade3);
  const [lectureLocation, setLectureLocation] = useState(init.lectureLocation);
  const [lectureDate, setLectureDate] = useState(init.lectureDate);
  const [lectureTime, setLectureTime] = useState(init.lectureTime);

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    grade1?: string;
    grade2?: string;
    grade3?: string;
  }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "강연 제목을 입력해주세요.";
    if (!description.trim()) next.description = "강연 내용을 입력해주세요.";
    if (grade1 === "" || isNaN(Number(grade1)) || Number(grade1) < 0) next.grade1 = "0명 이상이어야 합니다.";
    if (grade2 === "" || isNaN(Number(grade2)) || Number(grade2) < 0) next.grade2 = "0명 이상이어야 합니다.";
    if (grade3 === "" || isNaN(Number(grade3)) || Number(grade3) < 0) next.grade3 = "0명 이상이어야 합니다.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      gradeCapacities: {
        "1": Number(grade1),
        "2": Number(grade2),
        "3": Number(grade3),
      },
      lectureLocation: lectureLocation.trim() || undefined,
      lectureDate: lectureDate || undefined,
      lectureTime: lectureTime || undefined,
    });
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

      {/* 학년별 최대 인원 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">학년별 최대 인원</label>
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

      <div className="flex gap-3 mt-2">
        <Button onClick={handleSubmit} disabled={isPending} className="py-3">
          {isPending ? `${submitLabel} 중...` : submitLabel}
        </Button>
        {extraAction}
      </div>
    </div>
  );
}
