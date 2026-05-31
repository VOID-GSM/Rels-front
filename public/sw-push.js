const NOTIFICATION_TEMPLATES = {
  LECTURE_CREATED: {
    title: "새 강연이 개설되었습니다",
    body: (data) => data.body || "새로운 강연을 확인해보세요!",
    url: (data) => (data.lectureId ? `/lectures/${data.lectureId}` : "/"),
  },
  WAITLIST_TO_ENROLLED: {
    title: "수강 신청 완료",
    body: (data) => data.body || "대기자 명단에서 수강생으로 이동되었습니다.",
    url: (data) => (data.lectureId ? `/lectures/${data.lectureId}` : "/my"),
  },
  LECTURE_CONFIRMED: {
    title: "강연 개설 확정",
    body: (data) => data.body || "신청한 강연이 개설 확정되었습니다.",
    url: (data) => (data.lectureId ? `/lectures/${data.lectureId}` : "/my"),
  },
  LECTURE_UNCONFIRMED: {
    title: "강연 개설 불확정",
    body: (data) => data.body || "신청한 강연이 개설되지 않습니다.",
    url: (data) => (data.lectureId ? `/lectures/${data.lectureId}` : "/my"),
  },
  LECTURE_ENDED: {
    title: "강연 종료",
    body: (data) => data.body || "강연이 종료되었습니다.",
    url: (data) => (data.lectureId ? `/lectures/${data.lectureId}` : "/my"),
  },
};

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { type: "LECTURE_CREATED", body: event.data.text() };
  }

  const template =
    NOTIFICATION_TEMPLATES[data.type] || NOTIFICATION_TEMPLATES.LECTURE_CREATED;

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

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.endsWith(url) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
