"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export interface MarkdownContentProps {
  children: string;
  className?: string;
  size?: "sm" | "base";
}

/* react-markdown v9 부터 code 에 inline 플래그를 주지 않는다.
   pre 가 켜 주는 컨텍스트로 블록/인라인을 구분한다. */
const InsidePreContext = createContext(false);

function CodeRenderer({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const insidePre = useContext(InsidePreContext);

  if (insidePre) {
    return (
      <code className={`block font-mono text-[13px] leading-6 text-gray-800 ${className ?? ""}`}>
        {children}
      </code>
    );
  }

  return (
    <code className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[0.88em] break-words text-gray-800">
      {children}
    </code>
  );
}

const SIZE_STYLE = {
  sm: {
    root: "space-y-2.5 text-sm leading-7 break-words text-gray-700",
    h1: "mt-4 text-base leading-6 font-bold text-gray-900",
    h2: "mt-4 text-[15px] leading-6 font-bold text-gray-900",
    h3: "mt-3 text-sm leading-6 font-semibold text-gray-900",
  },
  base: {
    root: "space-y-4 text-[19px] leading-9 break-words text-gray-800",
    h1: "mt-7 text-2xl leading-9 font-bold text-gray-900",
    h2: "mt-6 text-xl leading-8 font-bold text-gray-900",
    h3: "mt-5 text-lg leading-7 font-semibold text-gray-900",
  },
} as const;

function buildComponents(size: "sm" | "base"): Components {
  const s = SIZE_STYLE[size];

  return {
    h1: ({ children }) => <h1 className={s.h1}>{children}</h1>,
    h2: ({ children }) => <h2 className={s.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={s.h3}>{children}</h3>,

    p: ({ children }) => <p className="break-words">{children}</p>,

    ul: ({ children }) => (
      <ul className="list-disc space-y-1 pl-5 marker:text-gray-400">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal space-y-1 pl-5 marker:text-gray-400">{children}</ol>
    ),
    li: ({ children }) => <li className="break-words">{children}</li>,

    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    del: ({ children }) => (
      <del className="text-gray-500 line-through">{children}</del>
    ),

    code: ({ className, children }) => (
      <CodeRenderer className={className}>{children}</CodeRenderer>
    ),
    /* 긴 코드가 본문 폭을 밀지 않도록 가로 스크롤 컨테이너로 감싼다. */
    pre: ({ children }) => (
      <InsidePreContext.Provider value={true}>
        <div className="overflow-x-auto rounded-xl bg-gray-50 shadow-e1">
          <pre className="w-max min-w-full px-3.5 py-3">{children}</pre>
        </div>
      </InsidePreContext.Provider>
    ),

    blockquote: ({ children }) => (
      <blockquote className="space-y-2 rounded-r-lg border-l-[3px] border-main bg-main-soft px-4 py-2.5 text-gray-700">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="h-px border-0 bg-gray-200" />,

    /* 외부 링크는 새 탭으로 열되 opener 를 넘기지 않는다. */
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-main-strong underline underline-offset-2"
      >
        {children}
      </a>
    ),

    table: ({ children }) => (
      <div className="overflow-x-auto rounded-xl shadow-e1">
        <table className="w-max min-w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-gray-200 last:border-b-0">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-xs font-semibold whitespace-nowrap text-gray-700">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 align-top text-gray-700">{children}</td>
    ),

    /* GFM 체크리스트는 읽기 전용이므로 조작할 수 없게 둔다. */
    input: ({ checked, type }) =>
      type === "checkbox" ? (
        <input
          type="checkbox"
          checked={Boolean(checked)}
          readOnly
          disabled
          className="mr-1.5 accent-main"
        />
      ) : null,

    /* 임의의 외부 이미지 삽입은 허용하지 않는다. */
    img: () => null,
  };
}

export default function MarkdownContent({
  children,
  className,
  size = "base",
}: MarkdownContentProps) {
  const components = useMemo(() => buildComponents(size), [size]);
  const source = children ?? "";

  if (!source.trim()) return null;

  return (
    /* 첫 요소의 위 여백은 앞 블록과의 간격을 깨뜨리므로 제거한다. */
    <div
      className={`${SIZE_STYLE[size].root} [&>*:first-child]:mt-0 ${className ?? ""}`}
    >
      {/* 기존 소개글은 평문 전제로 쓰여서, 단일 개행을 접으면 문단이 뭉갠다. */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
