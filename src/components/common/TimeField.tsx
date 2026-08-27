"use client";

import { useState } from "react";
import ChevronDown from "@/assets/svg/ChevronDown";

type Meridiem = "AM" | "PM";

const pad = (value: number) => String(value).padStart(2, "0");

/** 5분 간격. 강연 시간은 대부분 정각이나 30분이라 목록을 짧게 유지합니다. */
const MINUTE_STEP = 5;

const MERIDIEMS: { key: Meridiem; label: string }[] = [
  { key: "AM", label: "오전" },
  { key: "PM", label: "오후" },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);

/** "16:30" / "16:30:00" → 오후 4시 30분. 못 읽으면 null. */
const parseTime = (value?: string | null) => {
  if (!value) return null;

  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return {
    meridiem: (hour < 12 ? "AM" : "PM") as Meridiem,
    // 0시는 오전 12시, 12시는 오후 12시입니다.
    hour12: hour % 12 === 0 ? 12 : hour % 12,
    minute,
  };
};

const to24Hour = (hour12: number, meridiem: Meridiem) => {
  if (meridiem === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
};

interface TimeFieldProps {
  label?: string;
  /** "HH:mm". 아직 덜 고른 상태는 빈 문자열로 알립니다. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** 메시지는 밖에서 보여 주고 테두리만 붉게 할 때 씁니다. */
  invalid?: boolean;
  className?: string;
}

/**
 * 오전/오후를 버튼으로 빼낸 시각 입력.
 *
 * 브라우저가 그리는 <input type="time">은 오전/오후 칸이 작고 기기마다 다르게
 * 보여서, 가장 자주 틀리는 오전/오후를 눌러서 고르게 했습니다.
 *
 * 시를 고르기 전까지는 부모에게 빈 값을 알립니다. 그동안 고른 오전/오후와 분은
 * 안에서 들고 있으므로, 부모가 값을 비워도 화면은 그대로 남습니다.
 */
export default function TimeField({
  label,
  value,
  onChange,
  error,
  invalid,
  className = "",
}: TimeFieldProps) {
  const initial = parseTime(value);

  const [meridiem, setMeridiem] = useState<Meridiem>(initial?.meridiem ?? "PM");
  const [hour, setHour] = useState(initial ? String(initial.hour12) : "");
  const [minute, setMinute] = useState(initial ? pad(initial.minute) : "");

  // 밖에서 값이 바뀌면 따라갑니다. 우리가 올린 값이 되돌아오면 결과가 같아서
  // 그대로 두게 됩니다.
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    const parsed = parseTime(value);
    if (parsed) {
      setMeridiem(parsed.meridiem);
      setHour(String(parsed.hour12));
      setMinute(pad(parsed.minute));
    }
  }

  const emit = (
    nextMeridiem: Meridiem,
    nextHour: string,
    nextMinute: string,
  ) => {
    if (!nextHour) {
      onChange("");
      return;
    }

    onChange(
      `${pad(to24Hour(Number(nextHour), nextMeridiem))}:${nextMinute || "00"}`,
    );
  };

  const handleMeridiem = (next: Meridiem) => {
    setMeridiem(next);
    emit(next, hour, minute);
  };

  const handleHour = (next: string) => {
    setHour(next);
    // 시만 고르고 넘어가는 일이 많아서 분은 정각으로 채워 둡니다.
    const nextMinute = next && !minute ? "00" : minute;
    setMinute(nextMinute);
    emit(meridiem, next, nextMinute);
  };

  const handleMinute = (next: string) => {
    setMinute(next);
    emit(meridiem, hour, next);
  };

  const minuteOptions = Array.from(
    { length: 60 / MINUTE_STEP },
    (_, i) => i * MINUTE_STEP,
  );
  // 5분 간격에서 벗어난 값이 이미 저장돼 있으면 그 값도 고를 수 있게 둡니다.
  if (minute && !minuteOptions.includes(Number(minute))) {
    minuteOptions.push(Number(minute));
    minuteOptions.sort((a, b) => a - b);
  }

  // 브라우저가 그리는 화살표는 테두리에 바짝 붙어서, 화살표를 직접 그리고
  // 오른쪽에 자리를 비워 둡니다.
  const selectStyle = `field h-11 w-full cursor-pointer appearance-none rounded-xl pl-3.5 pr-9 text-sm text-gray-900 ${
    error || invalid ? "field-error" : ""
  }`;

  const chevronStyle =
    "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400";

  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold tracking-wide text-gray-600">
          {label}
        </label>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex w-fit gap-0.5 rounded-xl bg-gray-100 p-1">
          {MERIDIEMS.map(({ key, label: meridiemLabel }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleMeridiem(key)}
              aria-pressed={meridiem === key}
              className={`focusable h-9 cursor-pointer rounded-lg px-3.5 text-sm font-medium transition-[background-color,box-shadow,color] ${
                meridiem === key
                  ? "bg-surface text-gray-900 shadow-e1"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {meridiemLabel}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative w-[92px]">
            <select
              aria-label={label ? `${label} 시` : "시"}
              value={hour}
              onChange={(e) => handleHour(e.target.value)}
              className={selectStyle}
            >
              <option value="" disabled>
                시
              </option>
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}시
                </option>
              ))}
            </select>
            <span className={chevronStyle}>
              <ChevronDown />
            </span>
          </div>
          <div className="relative w-[98px]">
            <select
              aria-label={label ? `${label} 분` : "분"}
              value={minute}
              onChange={(e) => handleMinute(e.target.value)}
              className={selectStyle}
            >
              <option value="" disabled>
                분
              </option>
              {minuteOptions.map((m) => (
                <option key={m} value={pad(m)}>
                  {pad(m)}분
                </option>
              ))}
            </select>
            <span className={chevronStyle}>
              <ChevronDown />
            </span>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
