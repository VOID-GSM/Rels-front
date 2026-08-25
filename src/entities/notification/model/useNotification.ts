import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/shared/api";
import { notificationUrl } from "@/shared/api/apiUrls";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { detectPlatform, isStandaloneNow } from "@/shared/lib/pwaDisplayMode";
import type { PushStatus, PushSubscriptionPayload } from "./types";

const BASE64URL_PATTERN = /^[A-Za-z0-9\-_]+=*$/;

/** 사용자에게 그대로 보여 줄 실패 사유입니다. */
const PUSH_ERROR = {
  unsupported: "이 브라우저는 알림을 지원하지 않습니다.",
  iosNeedsInstall: "iPhone·iPad는 홈 화면에 추가한 뒤에 알림을 켤 수 있습니다.",
  denied:
    "알림이 차단되어 있습니다. 브라우저 설정에서 이 사이트의 알림을 허용해 주세요.",
  vapid: "알림 설정이 올바르지 않습니다. 관리자에게 문의해 주세요.",
  subscribe: "알림 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.",
} as const;

/**
 * 사용자에게 보여 줘도 되는 실패입니다.
 * 브라우저가 던지는 DOMException은 영문이라 그대로 노출하면 안 되므로,
 * 우리가 만든 사유만 이 타입으로 감싸 구분합니다.
 */
class PushSetupError extends Error {}

function isValidVapidKey(key: string): boolean {
  return BASE64URL_PATTERN.test(key);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

function readVapidKey(): string {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (!vapidKey || !isValidVapidKey(vapidKey)) {
    console.warn(
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing or not a base64url encoded VAPID key.",
    );
    throw new PushSetupError(PUSH_ERROR.vapid);
  }
  return vapidKey;
}

/** 브라우저가 웹 푸시에 필요한 API를 모두 갖췄는지 봅니다. */
function isPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * 서비스워커에 푸시를 구독하고 서버로 보낼 payload를 만듭니다.
 * 권한 요청은 여기서 하지 않습니다 — 호출부가 제스처 안에서 먼저 끝내야 합니다.
 */
async function createSubscriptionPayload(): Promise<PushSubscriptionPayload> {
  const vapidKey = readVapidKey();

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new PushSetupError(PUSH_ERROR.subscribe);
  }

  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  };
}

/**
 * 지금 알림을 켤 수 있는 상태인지 판정합니다. 클라이언트에서만 호출해야 합니다.
 *
 * iOS 판정을 지원 여부보다 먼저 하는 이유: iOS Safari 탭에는 PushManager가
 * 아예 없어서 unsupported로 보이지만, 실제로는 홈 화면에 추가하면 켤 수 있습니다.
 * 순서를 바꾸면 해결 가능한 상황에 "지원하지 않는다"고 잘못 안내하게 됩니다.
 */
function resolvePushStatus(): Exclude<PushStatus, "loading"> {
  if (detectPlatform() === "ios" && !isStandaloneNow()) {
    return "ios-needs-install";
  }

  if (!isPushSupported()) return "unsupported";

  const permission = Notification.permission;
  if (permission === "denied") return "denied";
  if (permission === "granted") return "granted";
  return "default";
}

/** 권한 상태를 그대로 PushStatus로 옮깁니다. */
function statusFromPermission(
  permission: NotificationPermission,
): Exclude<PushStatus, "loading"> {
  if (permission === "granted") return "granted";
  if (permission === "denied") return "denied";
  return "default";
}

/**
 * 이미 허용된 권한으로 조용히 다시 구독합니다.
 *
 * 권한 요청(`Notification.requestPermission`)은 일부러 하지 않습니다.
 * 이 훅은 로그인 직후 useEffect에서 불리는데, 사용자 제스처 밖에서 권한을
 * 요청하면 iOS Safari가 팝업을 아예 띄우지 않고 무시해 버립니다.
 * 권한을 처음 묻는 일은 `usePushNotification().enable()`만 담당합니다.
 */
export function usePushSubscription() {
  const { mutate } = useMutation({
    mutationFn: (payload: PushSubscriptionPayload) =>
      post(notificationUrl.subscribe(), payload),
  });

  const mutateRef = useRef(mutate);
  useEffect(() => {
    mutateRef.current = mutate;
  }, [mutate]);

  const subscribe = useCallback(async () => {
    if (!isPushSupported()) return;
    if (Notification.permission !== "granted") return;

    try {
      mutateRef.current(await createSubscriptionPayload());
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
    }
  }, []);

  return { subscribe };
}

/**
 * 알림 권한 상태를 노출하고, 사용자 제스처에서 권한 요청부터 구독까지 진행합니다.
 * `enable`은 반드시 클릭 같은 제스처 핸들러에서 직접 호출해야 합니다.
 */
export function usePushNotification() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);

  // 서버에는 브라우저 권한도 실행 모드도 없으므로, 붙고 나서 한 번 읽습니다.
  useEffect(() => {
    setStatus(resolvePushStatus());
  }, []);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: PushSubscriptionPayload) =>
      post(notificationUrl.subscribe(), payload),
  });

  const enable = useCallback(async () => {
    setError(null);

    const current = resolvePushStatus();
    if (current === "ios-needs-install" || current === "unsupported") {
      setStatus(current);
      setError(
        current === "ios-needs-install"
          ? PUSH_ERROR.iosNeedsInstall
          : PUSH_ERROR.unsupported,
      );
      return;
    }

    // 제스처가 살아 있는 동안 권한부터 묻습니다. 앞에 await를 하나라도 두면
    // iOS Safari가 사용자 제스처로 인정하지 않아 팝업이 뜨지 않습니다.
    let permission = Notification.permission;
    if (permission !== "granted") {
      try {
        permission = await Notification.requestPermission();
      } catch (requestError) {
        console.error(
          "Failed to request notification permission:",
          requestError,
        );
        setStatus(statusFromPermission(Notification.permission));
        setError(PUSH_ERROR.denied);
        return;
      }
    }

    // 물어본 결과를 그대로 상태에 반영합니다.
    setStatus(statusFromPermission(permission));
    if (permission !== "granted") {
      setError(PUSH_ERROR.denied);
      return;
    }

    setIsEnabling(true);
    try {
      // 구독 단계와 전송 단계를 나눠 잡습니다. 브라우저가 던지는 DOMException은
      // 영문이라 사용자에게 보여줄 수 없고, 전송 실패는 서버 사유를 살려야 합니다.
      let payload: PushSubscriptionPayload;
      try {
        payload = await createSubscriptionPayload();
      } catch (subscribeError) {
        console.error("Failed to create push subscription:", subscribeError);
        setError(
          subscribeError instanceof PushSetupError
            ? subscribeError.message
            : PUSH_ERROR.subscribe,
        );
        return;
      }

      try {
        await mutateAsync(payload);
      } catch (postError) {
        console.error("Failed to send push subscription:", postError);
        setError(
          getApiErrorMessage(postError, {
            network: PUSH_ERROR.subscribe,
            timeout: PUSH_ERROR.subscribe,
          }),
        );
      }
    } finally {
      setIsEnabling(false);
    }
  }, [mutateAsync]);

  return { status, enable, isPending: isEnabling || isPending, error };
}
