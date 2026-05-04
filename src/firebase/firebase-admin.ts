import admin from 'firebase-admin';

export const FirebaseAdmin = Symbol('FirebaseAdmin');
export type FirebaseAdmin = admin.app.App;