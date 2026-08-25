export type NotificationType =
  | "LECTURE_CREATED"
  | "WAITLIST_TO_ENROLLED"
  | "LECTURE_CONFIRMED"
  | "LECTURE_UNCONFIRMED"
  | "LECTURE_ENDED";

export type PushSubscriptionPayload = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

/**
 * 푸시 알림을 켤 수 있는 상태인지 나타냅니다.
 * 화면은 이 값 하나로 "알림 켜기 버튼 / 설치 안내 / 차단 안내"를 갈라 그립니다.
 */
export type PushStatus =
  /** 클라이언트에 붙기 전. 서버 렌더와 어긋나지 않도록 아무것도 확정하지 않습니다. */
  | "loading"
  /** 브라우저가 웹 푸시 자체를 지원하지 않음. 안내 외에 할 수 있는 일이 없습니다. */
  | "unsupported"
  /** iOS인데 홈 화면 앱이 아님. 설치하면 켤 수 있으므로 설치를 안내합니다. */
  | "ios-needs-install"
  /** 사용자가 이미 차단함. 브라우저 설정에서 직접 풀어야 합니다. */
  | "denied"
  /** 권한 허용됨. 구독까지 끝난 상태를 포함합니다. */
  | "granted"
  /** 아직 물어본 적 없음. "알림 켜기" 버튼을 보여 줄 유일한 상태입니다. */
  | "default";

export type PushNotificationPayload = {
  type: NotificationType;
  title?: string;
  body?: string;
  lectureId?: number;
};
