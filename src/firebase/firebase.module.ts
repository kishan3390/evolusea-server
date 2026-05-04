import { Global, Module } from '@nestjs/common';
import admin, { auth } from 'firebase-admin';
import { App } from 'firebase-admin/app';
import { ConfigProvider } from '@config';

import { FirebaseAdmin } from './firebase-admin';
import { FirebaseAuth } from './firebase-auth';

@Global()
@Module({
  providers: [
    {
      provide: FirebaseAdmin,
      useFactory: () => {
        if (!ConfigProvider.firebase.googleCredentialsEncoded) {
          return admin.initializeApp();
        }

        const serviceAccountRaw = Buffer.from(
          ConfigProvider.firebase.googleCredentialsEncoded,
          'base64',
        ).toString('utf-8');
        const serviceAccount: admin.ServiceAccount =
          JSON.parse(serviceAccountRaw);
        const credential = admin.credential.cert(serviceAccount);
        return admin.initializeApp({ credential });
      },
    },
    {
      provide: FirebaseAuth,
      useFactory: (firebaseAdmin: App) => auth(firebaseAdmin),
      inject: [FirebaseAdmin],
    },
  ],
  exports: [FirebaseAdmin, FirebaseAuth],
})
export class FirebaseModule {}
