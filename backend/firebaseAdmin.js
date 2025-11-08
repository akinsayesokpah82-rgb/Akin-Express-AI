// backend/firebaseAdmin.js
import admin from "firebase-admin";

export function initFirebaseAdmin() {
  if (admin.apps.length) return admin;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) throw new Error("FIREBASE_SERVICE_ACCOUNT environment var is required");

  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin;
}
