/** 페이지 제목 줄. 카드에 담지 않고 캔버스 위에 그대로 올립니다. */
export default function PageHeader({
  title,
  description,
  actions,
  className = "",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`flex flex-wrap items-end justify-between gap-x-10 gap-y-4 ${className}`}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-[58ch] text-sm leading-relaxed text-gray-600">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
