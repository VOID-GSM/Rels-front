import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-70px)] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="tnum text-sm font-bold tracking-widest text-gray-400">
        404
      </p>
      <h1 className="text-2xl font-bold text-gray-900">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-sm text-gray-600">
        주소가 바뀌었거나 삭제된 페이지입니다.
      </p>
      <Link
        href="/"
        className="focusable mt-4 rounded-xl bg-main px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-e2 transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-e3"
      >
        강연 목록으로
      </Link>
    </div>
  );
}
