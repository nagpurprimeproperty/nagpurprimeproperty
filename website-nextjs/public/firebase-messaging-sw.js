importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Public Firebase config details for your admin panel web client
const firebaseConfig = {
  apiKey: "AIzaSyA9X9tQ4LGG5IemmobV9c1wNaDOKDI6oAA",
  authDomain: "nagpur-prime-property.firebaseapp.com",
  projectId: "nagpur-prime-property",
  storageBucket: "nagpur-prime-property.appspot.com",
  messagingSenderId: "547600422273",
  appId: "1:547600422273:web:d47919c834b2fd968c8480"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(title || 'New Notification', {
    body: body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data,
    requireInteraction: true,
  });
});

// Handle clicking on background notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin/notifications';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});