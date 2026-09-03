"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  LECTURE_TITLE_MAX_LENGTH,
  LECTURE_DESCRIPTION_MAX_LENGTH,
  LECTURE_MIN_CAPACITY,
  LECTURE_MAX_CAPACITY,
} from "@/constants/lecture";
import {
  getEnrollmentOpenAt,
  formatEnrollmentOpenAt,
} from "@/shared/lib/enrollmentWindow";
import type { UserSummary } from "@/entities/user";
import type { LectureFormValues, LectureFormData, FormErrors } from "./types";

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
  speakers: [],
};

const parseLocalDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function useLectureForm(
  initialValues?: Partial<LectureFormValues>,
  forceCapacityMode?: "total" | "grade",
  /**
   * 신청 오픈 16:20을 세는 기준 시각입니다. 학생회 승인 시각이고, 승인 전이면
   * 개설 시각입니다. 새로 만들 때는 넘기지 않으면 지금 시각으로 봅니다.
   */
  enrollmentBasisAt?: string | null,
) {
  const init = { ...DEFAULT_VALUES, ...initialValues };

  const [title, setTitle] = useState(init.title ?? "");
  const [description, setDescription] = useState(init.description ?? "");
  const [capacityMode, setCapacityMode] = useState<"total" | "grade">(
    forceCapacityMode ?? init.capacityMode,
  );
  const [totalCapacity, setTotalCapacity] = useState(init.totalCapacity ?? "");
  const [grade1, setGrade1] = useState(init.grade1 ?? "");
  const [grade2, setGrade2] = useState(init.grade2 ?? "");
  const [grade3, setGrade3] = useState(init.grade3 ?? "");
  const [lectureLocation, setLectureLocation] = useState(
    init.lectureLocation ?? "",
  );
  const [lectureDate, setLectureDate] = useState(init.lectureDate ?? "");
  const [lectureTime, setLectureTime] = useState(init.lectureTime ?? "");
  const [applicationDeadline, setApplicationDeadline] = useState(
    init.applicationDeadline ?? "",
  );
  const [speakers, setSpeakers] = useState<UserSummary[]>(init.speakers ?? []);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (key: keyof FormErrors) => {
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleModeChange = (mode: "total" | "grade") => {
    setCapacityMode(mode);
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    const missingFields: string[] = [];
    let capacityToastMessage: string | null = null;
    let dateToastMessage: string | null = null;

    if (!title.trim()) {
      next.title = "강연 제목을 입력해 주세요.";
      missingFields.push("강연 제목");
    } else if (title.trim().length > LECTURE_TITLE_MAX_LENGTH) {
      next.title = `강연 제목은 ${LECTURE_TITLE_MAX_LENGTH}자 이내로 입력해 주세요.`;
    }

    if (!description.trim()) {
      next.description = "강연 내용을 입력해 주세요.";
      missingFields.push("강연 내용");
    } else if (description.trim().length > LECTURE_DESCRIPTION_MAX_LENGTH) {
      next.description = `강연 내용은 ${LECTURE_DESCRIPTION_MAX_LENGTH}자 이내로 입력해 주세요.`;
    }

    if (capacityMode === "total") {
      const total = Number(totalCapacity);
      if (totalCapacity === "") {
        next.totalCapacity = "최대 인원을 입력해 주세요.";
        missingFields.push("최대 인원");
      } else if (Number.isNaN(total) || total < 0 || !Number.isInteger(total)) {
        next.totalCapacity = "0명 이상의 정수를 입력해 주세요.";
        capacityToastMessage = "최대 인원은 0명 이상의 정수로 입력해 주세요.";
      } else if (total < LECTURE_MIN_CAPACITY || total > LECTURE_MAX_CAPACITY) {
        next.totalCapacity = `${LECTURE_MIN_CAPACITY}명 이상 ${LECTURE_MAX_CAPACITY}명 이하로 입력해 주세요.`;
        capacityToastMessage = `강연 최대 인원은 ${LECTURE_MIN_CAPACITY}명 이상 ${LECTURE_MAX_CAPACITY}명 이하로 설정해 주세요.`;
      }
    } else {
      const g1 = Number(grade1);
      const g2 = Number(grade2);
      const g3 = Number(grade3);

      if (grade1 === "") {
        next.grade1 = "1학년 인원을 입력해 주세요.";
        missingFields.push("1학년 인원");
      } else if (Number.isNaN(g1) || g1 < 0 || !Number.isInteger(g1)) {
        next.grade1 = "0명 이상의 정수를 입력해 주세요.";
        capacityToastMessage =
          capacityToastMessage ??
          "학년별 인원은 0명 이상의 정수로 입력해 주세요.";
      }
      if (grade2 === "") {
        next.grade2 = "2학년 인원을 입력해 주세요.";
        missingFields.push("2학년 인원");
      } else if (Number.isNaN(g2) || g2 < 0 || !Number.isInteger(g2)) {
        next.grade2 = "0명 이상의 정수를 입력해 주세요.";
        capacityToastMessage =
          capacityToastMessage ??
          "학년별 인원은 0명 이상의 정수로 입력해 주세요.";
      }
      if (grade3 === "") {
        next.grade3 = "3학년 인원을 입력해 주세요.";
        missingFields.push("3학년 인원");
      } else if (Number.isNaN(g3) || g3 < 0 || !Number.isInteger(g3)) {
        next.grade3 = "0명 이상의 정수를 입력해 주세요.";
        capacityToastMessage =
          capacityToastMessage ??
          "학년별 인원은 0명 이상의 정수로 입력해 주세요.";
      }

      if (!next.grade1 && !next.grade2 && !next.grade3) {
        const total = g1 + g2 + g3;
        if (total < LECTURE_MIN_CAPACITY || total > LECTURE_MAX_CAPACITY) {
          const message = `학년별 인원 합계는 ${LECTURE_MIN_CAPACITY}명 이상 ${LECTURE_MAX_CAPACITY}명 이하로 입력해 주세요.`;
          next.grade1 = message;
          next.grade2 = message;
          next.grade3 = message;
          capacityToastMessage = message;
        }
      }
    }

    if (!lectureLocation.trim()) {
      next.lectureLocation = "장소를 입력해 주세요.";
      missingFields.push("장소");
    }
    if (!lectureDate) {
      next.lectureDate = "날짜를 입력해 주세요.";
      missingFields.push("날짜");
    }
    if (!lectureTime) {
      next.lectureTime = "시간을 입력해 주세요.";
      missingFields.push("시간");
    }
    if (!applicationDeadline) {
      next.applicationDeadline = "신청 마감일을 입력해 주세요.";
      missingFields.push("신청 마감일");
    }

    const lectureDateTime =
      lectureDate && lectureTime
        ? parseLocalDateTime(`${lectureDate}T${lectureTime}`)
        : null;
    const deadlineDateTime = applicationDeadline
      ? parseLocalDateTime(applicationDeadline)
      : null;
    const isDateChanged =
      lectureDate !== init.lectureDate || lectureTime !== init.lectureTime;
    const isDeadlineChanged = applicationDeadline !== init.applicationDeadline;

    if (
      lectureDateTime &&
      isDateChanged &&
      lectureDateTime.getTime() < Date.now()
    ) {
      next.lectureDate = "현재 날짜/시간 이후로 선택해 주세요.";
      next.lectureTime = "현재 날짜/시간 이후로 선택해 주세요.";
      dateToastMessage =
        "강연 날짜와 시간은 현재보다 이전으로 설정할 수 없습니다.";
    }

    if (
      deadlineDateTime &&
      isDeadlineChanged &&
      deadlineDateTime.getTime() < Date.now()
    ) {
      next.applicationDeadline = "현재 날짜/시간 이후로 선택해 주세요.";
      dateToastMessage =
        dateToastMessage ??
        "신청 마감일은 현재보다 이전으로 설정할 수 없습니다.";
    }

    // 신청은 16:20에 열립니다. 그전에 마감하면 아무도 신청할 수 없습니다.
    const enrollmentOpenAt = getEnrollmentOpenAt(
      enrollmentBasisAt ?? new Date().toISOString(),
    );

    if (
      deadlineDateTime &&
      isDeadlineChanged &&
      enrollmentOpenAt &&
      deadlineDateTime.getTime() <= enrollmentOpenAt.getTime()
    ) {
      const openText = formatEnrollmentOpenAt(enrollmentOpenAt);
      next.applicationDeadline = `${openText} 이후로 선택해 주세요.`;
      dateToastMessage =
        dateToastMessage ??
        `신청은 ${openText}부터 받습니다. 마감은 그 이후로 정해 주세요.`;
    }

    if (
      lectureDateTime &&
      deadlineDateTime &&
      // 백엔드는 "마감 < 강연 시작"만 통과시킵니다. 같은 시각이면 거절이라 >= 입니다.
      deadlineDateTime.getTime() >= lectureDateTime.getTime()
    ) {
      next.applicationDeadline = "신청 마감일은 강연 일시 이전이어야 합니다.";
      dateToastMessage =
        dateToastMessage ??
        "신청 마감일은 강연 일시보다 이후로 설정할 수 없습니다.";
    }

    setErrors(next);

    if (missingFields.length > 0) {
      toast.error(`${missingFields.join(", ")} 항목을 입력해 주세요.`);
    } else if (capacityToastMessage) {
      toast.error(capacityToastMessage);
    } else if (dateToastMessage) {
      toast.error(dateToastMessage);
    }

    return Object.keys(next).length === 0;
  };

  const buildSubmitData = (): LectureFormData => ({
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
    lectureLocation: lectureLocation.trim(),
    lectureDate,
    lectureTime,
    applicationDeadline,
    speakerIds: speakers.map((speaker) => speaker.userId),
  });

  return {
    values: {
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
      speakers,
    },
    setters: {
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
      setSpeakers,
    },
    errors,
    clearError,
    handleModeChange,
    validate,
    buildSubmitData,
  };
}
