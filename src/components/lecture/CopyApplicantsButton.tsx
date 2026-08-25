"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/shared/lib/clipboard";
import { formatApplicantList } from "@/shared/lib/formatApplicantList";

/**
 * 신청자 명단을 "1. 2204 김지유" 형태로 클립보드에 담습니다.
 * 학생회가 명단을 그대로 다른 곳에 붙여 넣을 때 씁니다.
 */
interface CopyApplicantsButtonProps {
  applicants: { name: string; studentNumber: string }[];
  className?: string;
}

export default function CopyApplicantsButton({
  applicants,
  className = "",
}: CopyApplicantsButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleCopy = async () => {
    const copied = await copyToClipboard(formatApplicantList(applicants));

    if (!copied) {
      toast.error("명단을 복사하지 못했습니다. 직접 선택해 복사해 주세요.");
      return;
    }

    // 토스트 대신 버튼 글자를 잠깐 바꿔, 누른 자리에서 바로 확인되게 합니다.
    setIsCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setIsCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={applicants.length === 0}
      aria-label={`신청자 ${applicants.length}명 명단 복사`}
      className={`focusable shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${
        isCopied
          ? "bg-main text-gray-900"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } ${className}`}
    >
      {isCopied ? "복사됨" : "명단 복사"}
    </button>
  );
}
