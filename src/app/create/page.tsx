"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Arrow from "@/assets/svg/Arrow";
import { useCreateLecture } from "@/entities/lecture";

export default function CreateLecturePage() {
  const router = useRouter();
  const { mutate: createLecture, isPending } = useCreateLecture();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade1, setGrade1] = useState("");
  const [grade2, setGrade2] = useState("");
  const [grade3, setGrade3] = useState("");
  const [lectureLocation, setLectureLocation] = useState("");
  const [lectureDate, setLectureDate] = useState("");
  const [lectureTime, setLectureTime] = useState("");

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
    if (!grade1 || Number(grade1) < 1) next.grade1 = "1명 이상이어야 합니다.";
    if (!grade2 || Number(grade2) < 1) next.grade2 = "1명 이상이어야 합니다.";
    if (!grade3 || Number(grade3) < 1) next.grade3 = "1명 이상이어야 합니다.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    createLecture(
      {
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
      },
      { onSuccess: () => router.push("/") },
    );
  };

  return (
    <main className="max-w-[600px] mx-auto px-6 py-10 flex flex-col gap-6">
      <Link
        href="/"
        className="flex items-center gap-1 text-sm text-gray-500 w-fit"
      >
        <Arrow />
        뒤로
      </Link>

      <div className="border border-main-200 rounded-2xl p-8 flex flex-col gap-6">
        <h1 className="text-xl font-bold text-gray-900">강연 생성</h1>

        <div className="flex flex-col gap-4">
          <Input
            label="강연 제목"
            placeholder="강연 제목"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title)
                setErrors((prev) => ({ ...prev, title: undefined }));
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
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
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
                min={1}
                placeholder="인원"
                value={grade1}
                onChange={(e) => {
                  setGrade1(e.target.value);
                  if (errors.grade1)
                    setErrors((prev) => ({ ...prev, grade1: undefined }));
                }}
                error={errors.grade1}
              />
              <Input
                label="2학년"
                type="number"
                min={1}
                placeholder="인원"
                value={grade2}
                onChange={(e) => {
                  setGrade2(e.target.value);
                  if (errors.grade2)
                    setErrors((prev) => ({ ...prev, grade2: undefined }));
                }}
                error={errors.grade2}
              />
              <Input
                label="3학년"
                type="number"
                min={1}
                placeholder="인원"
                value={grade3}
                onChange={(e) => {
                  setGrade3(e.target.value);
                  if (errors.grade3)
                    setErrors((prev) => ({ ...prev, grade3: undefined }));
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
        </div>

        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isPending}
          className="py-3"
        >
          {isPending ? "생성 중..." : "강연 생성"}
        </Button>
      </div>
    </main>
  );
}
