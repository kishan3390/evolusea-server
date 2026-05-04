import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase-config.ts';

export const firebaseApp = initializeApp(firebaseConfig);
