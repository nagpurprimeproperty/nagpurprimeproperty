import admin from 'firebase-admin';
import env from './env.js';

let firebaseApp;

const initFirebase = () => {
  try {
    if (!admin.apps.length) {
      if (env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);

        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        console.log('Firebase initialized (service account)');
      } 
      else if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId:   env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey:  env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });

        console.log('Firebase initialized (individual env vars)');
      }
      else {
        firebaseApp = admin.initializeApp();
        console.log('Firebase initialized (default credentials)');
      }
    } else {
      firebaseApp = admin.app();
      console.log('Firebase already initialized');
    }

    return firebaseApp;
  } catch (error) {
    console.error('Firebase init error:', error.message);
    process.exit(1);
  }
};

export default initFirebase;