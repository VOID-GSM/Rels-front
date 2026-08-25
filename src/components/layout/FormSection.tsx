/**
 * 설명이 왼쪽, 입력이 오른쪽에 오는 폼 섹션.
 * 폼 전체를 카드 하나에 몰아넣는 대신 가로로 펼쳐서 읽는 순서를 만듭니다.
 */
export default function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 py-9 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="max-w-[34ch] text-xs leading-relaxed text-gray-600">
            {description}
          </p>
        )}
      </div>
      <div className="flex max-w-[700px] flex-col gap-4">{children}</div>
    </section>
  );
}

/**
 * 제출 버튼 줄. 섹션과 같은 격자를 써서 왼쪽 설명 칸을 비우고 입력 열에
 * 맞춥니다. 페이지 맨 왼쪽에 붙어 있으면 입력과 축이 어긋나 보입니다.
 */
export function FormActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-5 pt-6 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12">
      <div className="hidden lg:block" />
      <div className="flex max-w-[700px] flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  );
}
