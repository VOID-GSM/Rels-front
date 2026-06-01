"use client";

import { useEffect, useRef } from "react";
import { usePushSubscription } from "@/entities/notification";
import { usePWAStore } from "@/stores/pwaStore";
import useAuthStore from "@/stores/authStore";
import PWAInstallBanner from "@/components/common/PWAInstallBanner";

export default function PWAProvider() {
  const { accessToken } = useAuthStore();
  const { subscribe } = usePushSubscription();
  const subscribedRef = useRef(false);
  const { capture } = usePWAStore();

  useEffect(() => {
    // 개발 환경에서는 next-pwa가 비활성화되므로 sw-push.js를 직접 등록
    // 프로덕션에서는 next-pwa가 worker/index.ts를 sw.js에 통합하여 처리
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "development") {
      navigator.serviceWorker.register("/sw-push.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, [capture]);

  useEffect(() => {
    if (accessToken && !subscribedRef.current) {
      subscribedRef.current = true;
      subscribe();
    }
  }, [accessToken, subscribe]);

  return <PWAInstallBanner />;
}
