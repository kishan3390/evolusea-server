/* eslint-env serviceworker */

import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';
import { firebaseConfig } from './config.js';

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);


// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// Keep in mind that FCM will still show notification messages automatically 
// and you should use data messages for custom notifications.
// For more info see: 
// https://firebase.google.com/docs/cloud-messaging/concept-options
onBackgroundMessage(messaging, function(payload) {
  // eslint-disable-next-line no-undef
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  // eslint-disable-next-line no-undef
  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
