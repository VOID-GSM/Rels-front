"use client";

import { useState } from "react";
import TimeField from "./TimeField";

interface DateTimeFieldProps {
  label?: string;
  /** "YYYY-MM-DDTHH:mm". 날짜와 시각이 다 모이기 전에는 빈 문자열입니다. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/**
 * 날짜 칸과 오전/오후 시각 칸을 나눠 놓은 일시 입력.
 * <input type="datetime-local">은 오전/오후가 칸 안에 묻혀서 갈라 놓았습니다.
 */
export default function DateTimeField({
  label,
  value,
  onChange,
  error,
}: DateTimeFieldProps) {
  const [initialDate = "", initialTime = ""] = value.split("T");

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);

  // 밖에서 값이 바뀌면 따라갑니다. 비워서 오는 건 아직 덜 골랐다는 우리 신호라
  // 무시하고, 고르던 내용을 그대로 둡니다.
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    const [nextDate, nextTime] = value.split("T");
    if (nextDate && nextTime) {
      setDate(nextDate);
      setTime(nextTime);
    }
  }

  const emit = (nextDate: string, nextTime: string) => {
    onChange(nextDate && nextTime ? `${nextDate}T${nextTime}` : "");
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold tracking-wide text-gray-600">
          {label}
        </label>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="date"
          aria-label={label ? `${label} 날짜` : "날짜"}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            emit(e.target.value, time);
          }}
          className={`field h-11 rounded-xl px-3.5 text-sm text-gray-900 sm:w-[190px] ${
            error ? "field-error" : ""
          }`}
        />
        <TimeField
          value={time}
          onChange={(nextTime) => {
            setTime(nextTime);
            emit(date, nextTime);
          }}
          invalid={Boolean(error)}
          className="sm:w-auto"
        />
      </div>

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
