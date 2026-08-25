/**
 * 자리 게이지. 모든 강연은 결국 정원 싸움이라, 숫자를 읽기 전에 남은 자리를
 * 먼저 눈으로 잡을 수 있도록 카드/상세 하단에 한 줄로 깔아둡니다.
 */
export default function SeatMeter({
  enrolled,
  capacity,
  muted = false,
  className = "h-1",
}: {
  enrolled: number;
  capacity: number;
  /** 끝났거나 열리지 않은 강연은 게이지까지 눈에 띌 이유가 없습니다. */
  muted?: boolean;
  className?: string;
}) {
  if (!capacity) return null;

  const ratio = Math.min(Math.max(enrolled / capacity, 0), 1);

  return (
    <div
      aria-hidden
      className={`w-full overflow-hidden bg-gray-100 ${className}`}
    >
      <div
        className={`h-full transition-[width] duration-500 ease-out ${
          muted ? "bg-gray-300" : "bg-main"
        }`}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
