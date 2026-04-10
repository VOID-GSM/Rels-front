import Security from "@/assets/svg/Security";

export default function CouncilBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-main text-black px-3 py-1.5 rounded-lg text-sm font-semibold w-fit">
      <Security />
      학생회
    </div>
  );
}
