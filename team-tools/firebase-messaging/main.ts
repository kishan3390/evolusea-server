import { initializeApp } from 'firebase/app';
import { MessagePayload, deleteToken, getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseConfig, vapidKey } from './config.js';

initializeApp(firebaseConfig);

const messaging = getMessaging();
const swRegistrationPromise: Promise<ServiceWorkerRegistration | undefined> = (async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser.');
    return undefined;
  }

  try {
    const existing = await navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope');
    if (existing) {
      return existing;
    }

    return await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/firebase-cloud-messaging-push-scope',
      type: 'module',
    });
  } catch (error) {
    console.error('Unable to register Firebase messaging service worker.', error);
    return undefined;
  }
})();

// IDs of divs that display registration token UI or request permission UI.
const tokenDivId = 'token_div';
const permissionDivId = 'permission_div';

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.onBackgroundMessage` handler.
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Update the UI to include the received message.
  appendMessage(payload);
});

async function resetUI() {
  clearMessages();
  showToken('loading...');
  // Get registration token. Initially this makes a network call, once retrieved
  // subsequent calls to getToken will return from cache.
  try {
    const serviceWorkerRegistration = await swRegistrationPromise;
    if (!serviceWorkerRegistration) {
      throw new Error('Service worker registration missing.');
    }

    const currentToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration });
    if (currentToken) {
      sendTokenToServer(currentToken);
      updateUIForPushEnabled(currentToken);
    } else {
      console.log('No registration token available. Request permission to generate one.');
      updateUIForPushPermissionRequired();
      setTokenSentToServer(false);
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    showToken('Error retrieving registration token.');
    setTokenSentToServer(false);
  }
}


function showToken(currentToken: string) {
  // Show token in console and UI.
  const tokenElement = document.querySelector('#token')!;
  tokenElement.textContent = currentToken;
}

// Send the registration token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken: string) {
  if (!isTokenSentToServer()) {
    console.log('Sending token to server...', currentToken);
    // TODO(developer): Send the current token to your server.
    setTokenSentToServer(true);
  } else {
    console.log('Token already sent to server so won\'t send it again unless it changes');
  }
}

function isTokenSentToServer() {
  return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent: boolean) {
  window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

function showHideDiv(divId: string, show: boolean) {
  const div = document.querySelector('#' + divId)! as HTMLDivElement;
  if (show) {
    div.style.display = 'block';
  } else {
    div.style.display = 'none';
  }
}

function requestPermission() {
  console.log('Requesting permission...');
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // TODO(developer): Retrieve a registration token for use with FCM.
      // In many cases once an app has been granted notification permission,
      // it should update its UI reflecting this.
      resetUI().catch((error) => console.error('Unable to reset UI after permission grant.', error));
    } else {
      console.log('Unable to get permission to notify.');
    }
  });
}

function deleteTokenFromFirebase() {
  // Delete registration token.
  getToken(messaging).then((currentToken) => {
    deleteToken(messaging).then(() => {
      console.log('Token deleted.', currentToken);
      setTokenSentToServer(false);
      // Once token is deleted update UI.
      resetUI().catch((error) => console.error('Unable to reset UI after token deletion.', error));
    }).catch((err) => {
      console.log('Unable to delete token. ', err);
    });
  }).catch((err) => {
    console.log('Error retrieving registration token. ', err);
    showToken('Error retrieving registration token.');
  });
}

// Add a message to the messages element.
function appendMessage(payload: MessagePayload) {
  const messagesElement = document.querySelector('#messages')!;
  const dataHeaderElement = document.createElement('h5');
  const dataElement = document.createElement('pre');
  dataElement.style.overflowX = 'hidden;';
  dataHeaderElement.textContent = 'Received message:';
  dataElement.textContent = JSON.stringify(payload, null, 2);
  messagesElement.appendChild(dataHeaderElement);
  messagesElement.appendChild(dataElement);
}

// Clear the messages element of all children.
function clearMessages() {
  const messagesElement = document.querySelector('#messages')!;
  while (messagesElement.hasChildNodes()) {
    messagesElement.removeChild(messagesElement.lastChild!);
  }
}

function updateUIForPushEnabled(currentToken: string) {
  showHideDiv(tokenDivId, true);
  showHideDiv(permissionDivId, false);
  showToken(currentToken);
}

function updateUIForPushPermissionRequired() {
  showHideDiv(tokenDivId, false);
  showHideDiv(permissionDivId, true);
}

document.getElementById('request-permission-button')!.addEventListener('click', requestPermission);
document.getElementById('delete-token-button')!.addEventListener('click', deleteTokenFromFirebase);

resetUI().catch((error) => console.error('Unable to initialize Firebase Messaging UI.', error));
