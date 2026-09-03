"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cancel from "@/assets/svg/Cancel";
import Person from "@/assets/svg/Person";
import { useSearchUsers } from "@/entities/user";
import type { UserSummary } from "@/entities/user";

interface SpeakerPickerProps {
  /** 개설자를 뺀, 지금 고른 연사자들. */
  speakers: UserSummary[];
  onChange: (speakers: UserSummary[]) => void;
  /** 개설자 본인. 이미 연사자라서 검색 결과에서 걸러 냅니다. */
  excludeUserId?: number;
  max?: number;
}

const DEFAULT_MAX = 5;
// 한 글자 칠 때마다 요청을 보내면 검색이 타자를 따라오지 못합니다.
const SEARCH_DEBOUNCE_MS = 250;

export default function SpeakerPicker({
  speakers,
  onChange,
  excludeUserId,
  max = DEFAULT_MAX,
}: SpeakerPickerProps) {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedKeyword(keyword),
      SEARCH_DEBOUNCE_MS,
    );

    return () => clearTimeout(timer);
  }, [keyword]);

  // 바깥을 누르면 결과 목록이 닫혀야 그 아래 입력칸을 바로 누를 수 있습니다.
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const { data: results, isFetching } = useSearchUsers(debouncedKeyword);

  const isFull = speakers.length >= max;

  const visibleResults = useMemo(() => {
    if (!results) return [];

    const takenIds = new Set(speakers.map((speaker) => speaker.userId));
    if (excludeUserId != null) takenIds.add(excludeUserId);

    return results.filter((user) => !takenIds.has(user.userId));
  }, [results, speakers, excludeUserId]);

  const addSpeaker = (user: UserSummary) => {
    if (isFull) return;

    onChange([...speakers, user]);
    setKeyword("");
    setDebouncedKeyword("");
    setIsOpen(false);
  };

  const removeSpeaker = (userId: number) => {
    onChange(speakers.filter((speaker) => speaker.userId !== userId));
  };

  const hasSearched = debouncedKeyword.trim().length > 0;

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <label className="text-xs font-semibold tracking-wide text-gray-600">
        연사자
      </label>

      <div className="relative">
        <input
          className="field h-11 w-full rounded-xl px-3.5 text-sm text-gray-900 placeholder:text-gray-400"
          placeholder={
            isFull
              ? `연사자는 ${max}명까지 추가할 수 있습니다`
              : "이름 또는 학번으로 검색"
          }
          value={keyword}
          disabled={isFull}
          onChange={(e) => {
            setKeyword(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />

        {isOpen && hasSearched && !isFull && (
          <ul className="scrollbar-hide absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl bg-surface p-1.5 shadow-e3">
            {visibleResults.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-gray-500">
                {isFetching ? "찾는 중" : "검색 결과가 없습니다."}
              </li>
            ) : (
              visibleResults.map((user) => (
                <li key={user.userId}>
                  <button
                    type="button"
                    onClick={() => addSpeaker(user)}
                    className="focusable flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
                  >
                    <span className="text-gray-400">
                      <Person />
                    </span>
                    <span className="truncate text-sm font-semibold text-gray-900">
                      {user.name}
                    </span>
                    <span className="tnum ml-auto shrink-0 text-xs text-gray-600">
                      {user.studentNumber}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {speakers.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {speakers.map((speaker) => (
            <li key={speaker.userId}>
              <span className="inline-flex items-center gap-2 rounded-lg bg-main-soft py-1.5 pl-3 pr-2 text-xs font-semibold text-gray-900">
                <span className="tnum text-gray-600">
                  {speaker.studentNumber}
                </span>
                {speaker.name}
                <button
                  type="button"
                  aria-label={`${speaker.name} 연사자 빼기`}
                  onClick={() => removeSpeaker(speaker.userId)}
                  className="focusable cursor-pointer rounded p-0.5 text-gray-500 transition-colors hover:text-error"
                >
                  <Cancel />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-gray-500">
        개설자는 연사자로 자동 등록됩니다. 함께 진행하는 사람이 있으면 최대 {max}
        명까지 추가해 주세요.
      </p>
    </div>
  );
}
