// firebase-admin.js
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const fcm = admin.messaging();
