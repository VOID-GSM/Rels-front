/**
 * 모든 페이지가 쓰는 가로 골격.
 * 좁은 박스에 가두지 않고 화면 폭을 그대로 쓰되, 안쪽 여백만 단계별로 넓힙니다.
 */
export default function PageShell({
  children,
  size = "full",
  className = "",
}: {
  children: React.ReactNode;
  /** 읽고 쓰기만 하는 페이지는 조금 좁혀서 오른쪽이 비어 보이지 않게 합니다. */
  size?: "full" | "narrow";
  className?: string;
}) {
  return (
    <main
      className={`mx-auto w-full ${
        size === "narrow" ? "max-w-[1080px]" : "max-w-[1440px]"
      } px-6 pb-24 pt-8 md:px-10 xl:px-16 ${className}`}
    >
      {children}
    </main>
  );
}
