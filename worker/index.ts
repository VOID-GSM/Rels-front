/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const NOTIFICATION_TEMPLATES: Record<
  string,
  {
    title: string;
    body: (data: Record<string, string>) => string;
    url: (data: Record<string, string>) => string;
  }
> = {
  LECTURE_CREATED: {
    title: "새 강연이 개설되었습니다",
    body: (data) => data.body || "새로운 강연을 확인해보세요!",
    url: (data) => (data.lectureId ? `/lectures/${data.lectureId}` : "/"),
  },
  WAITLIST_TO_ENROLLED: {
    title: "수강 신청 완료",
    body: (data) => data.body || "대기자 명단에서 수강생으로 이동되었습니다.",
    url: (data) => (data.lectureId ? `/lectures/${data.lectureId}` : "/mypage"),
  },
  LECTURE_CONFIRMED: {
    title: "강연 개설 확정",
    body: (data) => data.body || "신청한 강연이 개설 확정되었습니다.",
    url: (data) => (data.lectureId ? `/lectures/${data.lectureId}` : "/mypage"),
  },
  LECTURE_UNCONFIRMED: {
    title: "강연 개설 불확정",
    body: (data) => data.body || "신청한 강연이 개설되지 않습니다.",
    url: (data) => (data.lectureId ? `/lectures/${data.lectureId}` : "/mypage"),
  },
  LECTURE_ENDED: {
    title: "강연 종료",
    body: (data) => data.body || "강연이 종료되었습니다.",
    url: (data) => (data.lectureId ? `/lectures/${data.lectureId}` : "/mypage"),
  },
};

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data: Record<string, string>;
  try {
    data = event.data.json();
  } catch {
    data = { type: "LECTURE_CREATED", body: event.data.text() };
  }

  const template =
    NOTIFICATION_TEMPLATES[data.type] ?? NOTIFICATION_TEMPLATES.LECTURE_CREATED;

  event.waitUntil(
    self.registration.showNotification(template.title, {
      body: template.body(data),
      icon: "/img/Rels_logo_192x192.png",
      badge: "/img/Rels_logo_192x192.png",
      data: { url: template.url(data) },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url: string = event.notification.data?.url || "/";
  const targetUrl = new URL(url, self.location.origin);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname === targetUrl.pathname && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl.href);
      })
  );
});
