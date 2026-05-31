"use client";

import { useEffect, useRef } from "react";
import { usePushSubscription } from "@/entities/notification";
import useAuthStore from "@/stores/authStore";
import PWAInstallBanner from "@/components/common/PWAInstallBanner";

export default function PWAProvider() {
  const { accessToken } = useAuthStore();
  const { subscribe } = usePushSubscription();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw-push.js").catch(() => {});
  }, []);

  useEffect(() => {
    if (accessToken && !subscribedRef.current) {
      subscribedRef.current = true;
      subscribe();
    }
  }, [accessToken, subscribe]);

  return <PWAInstallBanner />;
}
