/* global importScripts, firebase */

'use strict';

// Firebase Cloud Messaging (FCM) requires a dedicated service worker script.
// Flutter's own `flutter_service_worker.js` controls the app shell; FCM
// registers this worker under `/firebase-cloud-messaging-push-scope`.

// Firebase Messaging installs its own `notificationclick` handler which calls
// `stopImmediatePropagation()`. To deep-link into the app without requiring
// server-side `webpush.fcmOptions.link` configuration, we register our handler
// *before* importing Firebase scripts.
self.addEventListener('notificationclick', function (event) {
  const ticketId = resolveTicketId(event.notification && event.notification.data);
  if (!ticketId || event.action) {
    return;
  }

  event.stopImmediatePropagation();
  event.notification.close();

  const url = new URL('/', self.location.origin);
  url.searchParams.set('ticketId', ticketId);
  event.waitUntil(openOrFocus(url.toString()));
});

importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAuP4nShQ60Axflrnjvplsro5OD2YjYslM',
  authDomain: 'profit-lens-prod-2e417.firebaseapp.com',
  projectId: 'profit-lens-prod-2e417',
  storageBucket: 'profit-lens-prod-2e417.firebasestorage.app',
  messagingSenderId: '117544150167',
  appId: '1:117544150167:web:9a18d96b6b193da94f75d2',
});

// Registers background handlers and push event wiring.
firebase.messaging();

function resolveTicketId(data) {
  if (!data) return '';
  if (typeof data.ticketId === 'string' && data.ticketId.length > 0) {
    return data.ticketId;
  }

  // When FCM auto-displays notifications, the payload is stored under `FCM_MSG`.
  if (
    data.FCM_MSG &&
    data.FCM_MSG.data &&
    typeof data.FCM_MSG.data.ticketId === 'string' &&
    data.FCM_MSG.data.ticketId.length > 0
  ) {
    return data.FCM_MSG.data.ticketId;
  }

  return '';
}

async function openOrFocus(targetUrl) {
  const clientsList = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  for (let i = 0; i < clientsList.length; i++) {
    const client = clientsList[i];
    if (!client) continue;
    if (!('navigate' in client)) continue;
    const clientUrl = new URL(client.url);
    if (clientUrl.origin !== self.location.origin) continue;
    await client.navigate(targetUrl);
    return client.focus();
  }

  if (self.clients.openWindow) {
    return self.clients.openWindow(targetUrl);
  }

  return undefined;
}
