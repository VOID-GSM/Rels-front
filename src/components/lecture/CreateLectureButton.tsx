import Link from "next/link";
import Plus from "@/assets/svg/Plus";

export default function CreateLectureButton() {
  return (
    <Link
      href="/create"
      className="focusable flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-main px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-e2 transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-e3"
    >
      <Plus />
      강연 개설
    </Link>
  );
}
