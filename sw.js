/* MSAKUZI Admin Service Worker
   Handles notification clicks (CONFIRM / REJECT) even when browser is in background
*/

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// When user clicks the notification or one of its action buttons
self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const action = event.action; // "confirm" | "reject" | "" (body click)
  const data = notification.data || {};
  const token = data.token || "";
  const url = data.url || "./admin.html";

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
