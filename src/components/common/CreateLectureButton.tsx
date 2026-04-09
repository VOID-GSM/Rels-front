import Link from "next/link";
import Plus from "@/assets/svg/Plus";

export default function CreateLectureButton() {
  return (
    <Link
      href="/create"
      className="w-[110px] flex items-center gap-1.5 bg-main text-black px-4 py-2 rounded-lg font-medium text-sm"
    >
      <Plus />
      강연 생성
    </Link>
  );
}
