import Security from "@/assets/svg/Security";

export default function CouncilBadge() {
  return (
    <span className="flex w-fit items-center gap-1.5 rounded-full bg-main px-2.5 py-1 text-xs font-semibold text-gray-900">
      <Security />
      학생회
    </span>
  );
}
