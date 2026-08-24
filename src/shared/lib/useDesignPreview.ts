"use client";

import useAuthStore from "@/stores/authStore";

/**
 * 디자인 작업용 임시 장치입니다.
 *
 * 로그인하지 않은 상태에서도 모든 화면을 그대로 볼 수 있도록,
 * 세션 확인이 끝났는데 토큰이 없으면 목 데이터로 화면을 채웁니다.
 * 실제 로그인 흐름에는 영향을 주지 않으며, 디자인 수정이 끝나면
 * 이 파일과 사용처를 함께 제거하세요.
 *
 * 세션 확인 전(isSessionChecked === false)에는 false를 돌려주기 때문에
 * 새로고침 직후 로그인 유저에게 목 데이터가 잠깐 스치는 일은 없습니다.
 */
export function useDesignPreview() {
  const isSessionChecked = useAuthStore((s) => s.isSessionChecked);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return isSessionChecked && !isLoggedIn;
}
