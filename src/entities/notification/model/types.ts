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

export type PushNotificationPayload = {
  type: NotificationType;
  title?: string;
  body?: string;
  lectureId?: number;
};
