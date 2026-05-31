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
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw-push.js").catch(() => {});
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
