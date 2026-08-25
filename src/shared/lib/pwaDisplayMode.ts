import { useSyncExternalStore } from "react";

export type PlatformId = "ios" | "android" | "windows" | "mac";

/** 지금 보고 있는 기기를 알아냅니다. */
export const detectPlatform = (): PlatformId => {
  const ua = navigator.userAgent;

  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  // iPadOS는 자기를 Mac이라고 소개하므로 터치 지원 여부로 갈라냅니다.
  if (/Macintosh/.test(ua)) return navigator.maxTouchPoints > 1 ? "ios" : "mac";
  if (/Android/.test(ua)) return "android";
  return "windows";
};

/** 홈 화면에 설치된 앱으로 실행 중인지 봅니다. */
export const isStandaloneNow = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // iOS Safari는 display-mode 대신 이 값만 채워 줍니다.
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** 실행 모드는 설치 직후 브라우저 탭에서 앱 창으로 바뀔 수 있어 구독해 둡니다. */
export const subscribeDisplayMode = (onChange: () => void) => {
  const query = window.matchMedia("(display-mode: standalone)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * 서버에는 기기도 실행 모드도 없으므로, 붙고 나서 한 번 다시 그립니다.
 * useSyncExternalStore는 매 렌더마다 스냅샷을 다시 읽으므로 아래 함수들은
 * 모듈 스코프 상수로 두어 참조가 흔들리지 않게 합니다.
 */
const serverPlatform = (): PlatformId => "windows";
const serverStandalone = () => false;
const neverChanges = () => () => {};

/** 감지한 기기. 서버 렌더 중에는 "windows"입니다. */
export function usePlatform(): PlatformId {
  return useSyncExternalStore(neverChanges, detectPlatform, serverPlatform);
}

/** 앱으로 실행 중인지 여부. 서버 렌더 중에는 false입니다. */
export function useIsStandalone(): boolean {
  return useSyncExternalStore(
    subscribeDisplayMode,
    isStandaloneNow,
    serverStandalone,
  );
}
