import admin from 'firebase-admin';
import env from './env.js';

let firebaseApp;

const initFirebase = () => {
  try {
    if (!admin.apps.length) {

      // ── Option 1: Full service account JSON (highest priority) ───────────
      if (env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase initialized (service account JSON)');

      // ── Option 2: Individual env vars ─────────────────────────────────────
      } else if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
        let rawPrivateKey = env.FIREBASE_PRIVATE_KEY.trim();
        if (rawPrivateKey.startsWith('"') && rawPrivateKey.endsWith('"')) {
          rawPrivateKey = rawPrivateKey.slice(1, -1);
        }
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId:   env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey:  rawPrivateKey.replace(/\\n/g, '\n'),
          }),
        });
        console.log('Firebase initialized (individual env vars)');

      // ── Option 3: Application Default Credentials (GCP / Cloud Run) ──────
      } else {
        firebaseApp = admin.initializeApp();
        console.log('Firebase initialized (default credentials / ADC)');
      }

    } else {
      firebaseApp = admin.app();
    }

    return firebaseApp;
  } catch (error) {
    console.error('Firebase init error:', error.message);
    process.exit(1);
  }
};

/**
 * Returns the Firebase Messaging instance.
 * Ensures Firebase is initialised before returning.
 */
const getMessaging = () => {
  if (!admin.apps.length) {
    initFirebase();
  }
  return admin.messaging();
};

export { getMessaging };
export default initFirebase;