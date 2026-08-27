"use client";

import { useState, useEffect, useRef } from "react";

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
  endedLabel = "신청 마감",
  /** 마감은 다가올수록 붉게 급해지지만, 신청 시작은 재촉할 일이 아닙니다. */
  urgent = true,
  onEnd,
}: {
  deadline: string;
  className?: string;
  endedLabel?: string;
  urgent?: boolean;
  onEnd?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(deadline));

  // 신청 시작 카운트다운이 0에 닿으면 같은 자리에서 마감 카운트다운으로 바뀝니다.
  // 이때 React가 같은 인스턴스를 이어 쓰기 때문에, 0에 닿았던 상태를 그대로 두면
  // 다음 초까지 "신청 마감"이 잠깐 떴다가 시간이 다시 흐릅니다. 기한이 바뀌면
  // 다음 틱을 기다리지 않고 그 자리에서 다시 셉니다.
  const [countedDeadline, setCountedDeadline] = useState(deadline);
  if (deadline !== countedDeadline) {
    setCountedDeadline(deadline);
    setTimeLeft(getTimeLeft(deadline));
  }

  // 0이 되는 순간을 부모에게 알려야 버튼이 잠긴 채로 남지 않습니다.
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const next = getTimeLeft(deadline);
      setTimeLeft(next);
      if (!next) onEndRef.current?.();
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) {
    return (
      <span
        className={`font-bold ${urgent ? "text-error" : "text-gray-900"} ${className}`}
      >
        {endedLabel}
      </span>
    );
  }

  const { diff, days, hours, minutes, seconds } = timeLeft;
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // 하루 안쪽으로 들어오면 색으로 급한 티를 냅니다.
  const isUrgent = urgent && diff < DAY;

  return (
    <span
      className={`tnum font-bold ${isUrgent ? "text-error" : "text-gray-900"} ${className}`}
    >
      {days > 0 ? `${days}일 ` : ""}
      {timeStr}
    </span>
  );
}
