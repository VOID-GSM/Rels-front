import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-70px)] gap-4">
      <h1 className="text-6xl font-bold text-main-300">404</h1>
      <p className="text-xl font-medium text-gray-600">
        페이지를 찾을 수 없습니다.
      </p>
      <p className="text-sm text-gray-400">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/"
        className="mt-4 px-6 py-2 bg-main-300 text-white rounded-md font-medium"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
