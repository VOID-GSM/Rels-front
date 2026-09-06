"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { isTokenStorageEvent } from "@/shared/lib/tokenStorage";

/** 로그인 없이 열 수 있는 유일한 경로입니다. 나머지는 전부 막습니다. */
const PUBLIC_PATHS = ["/login", "/callback"];

export function isPublicPath(pathname: string | null) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname?.startsWith(`${path}/`),
  );
}

/**
 * 앱 전체의 단일 관문입니다.
 *
 * 세션 복원을 여기 한 곳에서만 돌리고, 복원이 끝났는데 토큰이 없으면
 * 어떤 화면도 그리지 않고 /login으로 보냅니다. 주소창에 직접 경로를 쳐도
 * 같은 경로를 타므로 비로그인 상태에서 볼 수 있는 화면은 없습니다.
 *
 * 서버 렌더와 첫 클라이언트 렌더 모두 isSessionChecked가 false여서
 * 하이드레이션이 어긋나지 않습니다.
 *
 * 토큰은 탭끼리 공유되므로 다른 탭에서 로그아웃하거나 토큰이 재발급되면
 * storage 이벤트를 받아 이 탭의 상태도 함께 맞춥니다.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const initFromSession = useAuthStore((s) => s.initFromSession);
  const syncFromStorage = useAuthStore((s) => s.syncFromStorage);
  const isSessionChecked = useAuthStore((s) => s.isSessionChecked);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const isPublic = isPublicPath(pathname);

  useEffect(() => {
    initFromSession();
  }, [initFromSession]);

  // storage 이벤트는 같은 오리진의 다른 탭에서만 날아옵니다.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!isTokenStorageEvent(event)) return;
      syncFromStorage();
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [syncFromStorage]);

  useEffect(() => {
    if (isPublic || !isSessionChecked || isLoggedIn) return;
    router.replace("/login");
  }, [isPublic, isSessionChecked, isLoggedIn, router]);

  if (isPublic) return <>{children}</>;

  // 세션 확인 중이거나 비로그인이면 내용을 한 프레임도 노출하지 않습니다.
  if (!isSessionChecked || !isLoggedIn) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-main" />
      </div>
    );
  }

  return <>{children}</>;
}
