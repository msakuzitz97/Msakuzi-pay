/* MSAKUZI Admin Service Worker
   Handles notification clicks (CONFIRM / REJECT) even when browser is in background
*/

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Receive server-sent Web Push even when the admin page is closed.
self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch (_) { payload = { body: event.data ? event.data.text() : "Ombi jipya la malipo" }; }

  const token = payload.token || payload.payment_token || "";
  const payerName = payload.payer_name || payload.name || "Mteja";
  const amount = payload.amount != null ? Number(payload.amount).toLocaleString("en-US") + " TSh" : "";
  const plan = payload.plan_code || payload.plan || "";
  const body = payload.body || `${payerName} — ${amount}${plan ? " (" + plan + ")" : ""}`;
  const options = {
    body,
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    tag: "msakuzi-" + (token || Date.now()),
    renotify: true,
    requireInteraction: true,
    vibrate: [400, 200, 400, 200, 400, 200, 400, 200],
    data: {
      token,
      payerName,
      amount,
      url: new URL("admin.html", self.registration.scope).href
    },
    actions: [
      { action: "confirm", title: "✅ CONFIRM" },
      { action: "reject", title: "❌ REJECT" }
    ]
  };
  event.waitUntil(self.registration.showNotification(payload.title || "MSAKUZI — Ombi jipya la malipo", options));
});

// When user clicks the notification or one of its action buttons
self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const action = event.action; // "confirm" | "reject" | "" (body click)
  const data = notification.data || {};
  const token = data.token || "";
  const url = data.url || new URL("admin.html", self.registration.scope).href;

  notification.close();

  event.waitUntil(
    (async () => {
      // Find an open admin window
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true
      });

      let client = null;
      for (const c of allClients) {
        if (c.url.includes("admin") || c.url.includes(url.replace("./", ""))) {
          client = c;
          break;
        }
      }
      // Fallback: any open window of this origin
      if (!client && allClients.length > 0) {
        client = allClients[0];
      }

      if (client) {
        // Focus existing window and send the action
        await client.focus();
        client.postMessage({
          type: "PAYMENT_ACTION",
          action: action || "open",
          token: token
        });
      } else {
        // No window open → open admin page
        // Action will be handled after page loads if we pass token in URL
        const openUrl = token
          ? `${url}?action=${action || "open"}&token=${encodeURIComponent(token)}`
          : url;
        await self.clients.openWindow(openUrl);
      }
    })()
  );
});

// Optional: close notification when another one with same tag arrives
self.addEventListener("notificationclose", (event) => {
  // nothing special needed
});
