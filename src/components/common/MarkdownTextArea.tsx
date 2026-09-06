"use client";

import { useEffect, useId, useRef, useState } from "react";
import MarkdownContent from "./MarkdownContent";

export interface MarkdownTextAreaProps {
  label: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}

type ToolbarItem =
  /* 선택 영역을 감싸는 문법 */
  | { key: string; label: string; title: string; kind: "wrap"; before: string; after: string; placeholder: string }
  /* 줄 머리에 붙는 문법 */
  | { key: string; label: string; title: string; kind: "prefix"; prefix: string; match: RegExp; ordered?: boolean };

const TOOLBAR: ToolbarItem[] = [
  { key: "bold", label: "굵게", title: "굵게 (**텍스트**)", kind: "wrap", before: "**", after: "**", placeholder: "굵은 텍스트" },
  { key: "heading", label: "제목", title: "제목 (## 텍스트)", kind: "prefix", prefix: "## ", match: /^#{1,6}\s/ },
  { key: "ul", label: "목록", title: "목록 (- 텍스트)", kind: "prefix", prefix: "- ", match: /^[-*]\s/ },
  { key: "ol", label: "번호", title: "번호 목록 (1. 텍스트)", kind: "prefix", prefix: "1. ", match: /^\d+\.\s/, ordered: true },
  { key: "code", label: "코드", title: "인라인 코드 (`텍스트`)", kind: "wrap", before: "`", after: "`", placeholder: "코드" },
  { key: "link", label: "링크", title: "링크 ([텍스트](url))", kind: "wrap", before: "[", after: "](url)", placeholder: "텍스트" },
];

type EditResult = { next: string; selectionStart: number; selectionEnd: number };

function applyWrap(
  value: string,
  start: number,
  end: number,
  item: Extract<ToolbarItem, { kind: "wrap" }>,
): EditResult {
  const selected = value.slice(start, end);
  const inner = selected || item.placeholder;
  const next = `${value.slice(0, start)}${item.before}${inner}${item.after}${value.slice(end)}`;
  const innerStart = start + item.before.length;

  return { next, selectionStart: innerStart, selectionEnd: innerStart + inner.length };
}

function applyPrefix(
  value: string,
  start: number,
  end: number,
  item: Extract<ToolbarItem, { kind: "prefix" }>,
): EditResult {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nextNewline = value.indexOf("\n", end);
  const lineEnd = nextNewline === -1 ? value.length : nextNewline;

  const lines = value.slice(lineStart, lineEnd).split("\n");
  const filled = lines.filter((line) => line.trim() !== "");
  /* 대상 줄이 모두 같은 접두사를 가지면 토글로 제거한다. */
  const allPrefixed = filled.length > 0 && filled.every((line) => item.match.test(line));

  /* 빈 줄은 건너뛰므로 배열 인덱스가 아니라 실제로 매긴 개수로 번호를 센다. */
  let ordinal = 0;
  const nextLines = lines.map((line) => {
    if (line.trim() === "" && filled.length > 0) return line;
    if (allPrefixed) return line.replace(item.match, "");
    ordinal += 1;
    return `${item.ordered ? `${ordinal}. ` : item.prefix}${line}`;
  });

  const block = nextLines.join("\n");
  const next = `${value.slice(0, lineStart)}${block}${value.slice(lineEnd)}`;
  const firstDelta = nextLines[0].length - lines[0].length;
  const totalDelta = block.length - (lineEnd - lineStart);
  const selectionStart = Math.max(lineStart, start + firstDelta);

  return { next, selectionStart, selectionEnd: Math.max(selectionStart, end + totalDelta) };
}

export default function MarkdownTextArea({
  label,
  value,
  maxLength,
  onChange,
  placeholder,
  rows = 5,
  error,
}: MarkdownTextAreaProps) {
  const safeValue = value ?? "";
  const fieldId = useId();
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<[number, number] | null>(null);

  /* 삽입으로 value 가 바뀐 다음에야 커서를 복원할 수 있다. */
  useEffect(() => {
    const selection = pendingSelection.current;
    const textarea = textareaRef.current;
    if (!selection || !textarea) return;

    pendingSelection.current = null;
    textarea.focus();
    textarea.setSelectionRange(selection[0], selection[1]);
  }, [safeValue]);

  const handleInsert = (item: ToolbarItem) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? safeValue.length;
    const end = textarea.selectionEnd ?? start;
    const result =
      item.kind === "wrap"
        ? applyWrap(safeValue, start, end, item)
        : applyPrefix(safeValue, start, end, item);

    /* 글자 수 제한을 넘기면 삽입 자체를 취소한다. */
    if (result.next.length > maxLength || result.next === safeValue) return;

    pendingSelection.current = [result.selectionStart, result.selectionEnd];
    onChange(result.next);
  };

  /* 미리보기 박스가 작성 탭과 비슷한 높이를 유지하도록 rows 로 환산한다. */
  const previewMinHeight = `${rows * 1.5 + 1.5}rem`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className="text-xs font-semibold tracking-wide text-gray-600"
      >
        {label}
      </label>

      {/* 탭과 툴바를 한 줄에 둔다. 좁은 화면에서는 툴바만 가로로 밀린다. */}
      <div className="flex items-center gap-2">
        <div className="inline-flex w-fit shrink-0 gap-0.5 rounded-xl bg-gray-100 p-1">
          {(
            [
              { key: "write", label: "작성" },
              { key: "preview", label: "미리보기" },
            ] as const
          ).map(({ key, label: tabLabel }) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
              className={`focusable rounded-lg px-3.5 py-1.5 text-sm font-medium transition-[background-color,box-shadow,color] ${
                tab === key
                  ? "bg-surface text-gray-900 shadow-e1"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tabLabel}
            </button>
          ))}
        </div>

        {tab === "write" && (
          <div className="scrollbar-hide flex min-w-0 flex-1 gap-0.5 overflow-x-auto">
            {TOOLBAR.map((item) => (
              <button
                key={item.key}
                type="button"
                title={item.title}
                aria-label={item.title}
                onClick={() => handleInsert(item)}
                className="focusable shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "write" ? (
        <textarea
          id={fieldId}
          ref={textareaRef}
          placeholder={placeholder}
          value={safeValue}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          rows={rows}
          className={`field w-full resize-none rounded-xl px-3.5 py-3 text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-900 placeholder:text-gray-400 ${
            error ? "field-error" : ""
          }`}
        />
      ) : (
        <div
          className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3"
          style={{ minHeight: previewMinHeight }}
        >
          {safeValue.trim() ? (
            <MarkdownContent size="sm">{safeValue}</MarkdownContent>
          ) : (
            <p className="text-sm text-gray-400">미리볼 내용이 없습니다.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {error ? (
          <p className="text-xs text-error">{error}</p>
        ) : (
          <span aria-hidden />
        )}
        <p className="tnum shrink-0 text-xs text-gray-500">
          {safeValue.length}/{maxLength}
        </p>
      </div>
    </div>
  );
}
