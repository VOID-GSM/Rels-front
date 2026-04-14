"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { useGetLectures } from "@/entities/lecture";
import CouncilBadge from "@/components/common/CouncilBadge";
import Arrow from "@/assets/svg/Arrow";
import Person from "@/assets/svg/Person";
import HashTag from "@/assets/svg/HashTag";
import Mail from "@/assets/svg/Mail";
import Building from "@/assets/svg/Building";
import Logout from "@/assets/svg/Logout";

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-main-50 rounded-xl p-4">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-gray-500">{value}</span>
      </div>
    </div>
  );
}

export default function MyPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const { data: lectures = [] } = useGetLectures();

  const handleLogout = () => {
    clearAuth();
    router.replace("/");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">로그인이 필요합니다.</p>
      </div>
    );
  }

  const myCreatedLectures = lectures.filter((l) => l.creatorId === user.userId);
  // 신청한 강연 API가 추가되면 연결
  const myEnrolledLectures: typeof lectures = [];

  return (
    <main className="max-w-[800px] mx-auto px-6 py-10 flex flex-col gap-6">
      {/* 뒤로 */}
      <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 w-fit">
        <Arrow />
        뒤로
      </Link>

      {/* 내 정보 카드 */}
      <div className="border border-main-200 rounded-2xl p-6 flex flex-col gap-5">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <Person />
          <span className="font-semibold text-gray-800">내 정보</span>
          {user.role === "ADMIN" && <CouncilBadge />}
        </div>

        {/* 정보 그리드 — 2열 */}
        <div className="grid grid-cols-2 gap-3">
          <InfoField icon={<Person />} label="이름" value={user.name} />
          <InfoField icon={<HashTag />} label="학번" value={user.studentNumber} />
          <InfoField icon={<Building />} label="학과" value={user.major ?? "-"} />
          <InfoField icon={<Mail />} label="이메일" value={user.email} />
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-error text-error rounded-xl py-3 text-sm font-medium hover:bg-error/5 transition-colors"
        >
          <Logout />
          로그아웃
        </button>
      </div>

      {/* 강연 섹션 — 2열 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 내가 생성한 강연 */}
        <div className="border border-main-200 rounded-2xl p-5 flex flex-col gap-3">
          <span className="font-semibold text-gray-800 text-sm">
            내가 생성한 강연 ({myCreatedLectures.length})
          </span>
          {myCreatedLectures.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              생성한 강연이 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {myCreatedLectures.map((lecture) => (
                <li key={lecture.lectureId}>
                  <Link
                    href={`/lectures/${lecture.lectureId}`}
                    className="flex items-center justify-between bg-main-50 rounded-xl px-4 py-3 hover:bg-main-100 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-gray-800 line-clamp-1">
                        {lecture.title}
                      </span>
                      <span className="text-xs text-gray-400">
                        {lecture.enrolledCount}명 신청
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 내가 신청한 강연 */}
        <div className="border border-main-200 rounded-2xl p-5 flex flex-col gap-3">
          <span className="font-semibold text-gray-800 text-sm">
            내가 신청한 강연 ({myEnrolledLectures.length})
          </span>
          {myEnrolledLectures.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              신청한 강연이 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {myEnrolledLectures.map((lecture) => (
                <li key={lecture.lectureId}>
                  <Link
                    href={`/lectures/${lecture.lectureId}`}
                    className="flex items-center justify-between bg-main-50 rounded-xl px-4 py-3 hover:bg-main-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-800 line-clamp-1">
                      {lecture.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
