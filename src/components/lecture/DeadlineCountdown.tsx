"use client";

import { useState, useEffect } from "react";

const DAY = 86400000;

function getTimeLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    diff,
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function DeadlineCountdown({
  deadline,
  className = "text-xs",
}: {
  deadline: string;
  className?: string;
}) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(deadline));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(deadline)), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) {
    return (
      <span className={`font-bold text-error ${className}`}>신청 마감</span>
    );
  }

  const { diff, days, hours, minutes, seconds } = timeLeft;
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // 하루 안쪽으로 들어오면 색으로 급한 티를 냅니다.
  const isUrgent = diff < DAY;

  return (
    <span
      className={`tnum font-bold ${isUrgent ? "text-error" : "text-gray-900"} ${className}`}
    >
      {days > 0 ? `${days}일 ` : ""}
      {timeStr}
    </span>
  );
}
