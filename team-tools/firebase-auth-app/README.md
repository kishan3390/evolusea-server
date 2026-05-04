# Auth App

A simple authentication app built with React, TypeScript, and Firebase. This app provides email/password and Google authentication using Firebase.

## Features
- Email sign-in
- Email sign-up
- Continue with Google
- Displays authentication token and user info

## Getting Started

### 1. Install dependencies

Using Yarn:
```bash
yarn install
```

### 2. Configure Firebase

Copy the Firebase config template and fill in your Firebase project credentials:

```bash
cp src/firebase-config.ts.template src/firebase-config.ts
```

Edit `src/firebase-config.ts` and provide your Firebase project's configuration:

```ts
export const firebaseConfig = {
  apiKey: '<YOUR_API_KEY>',
  authDomain: '<YOUR_AUTH_DOMAIN>',
  projectId: '<YOUR_PROJECT_ID>',
  appId: '<YOUR_APP_ID>'
}
```

You can find these values in your [Firebase Console](https://console.firebase.google.com/) under Web Project Settings.

### 3. Run the app

```bash
yarn run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.
