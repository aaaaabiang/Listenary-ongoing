import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = new Proxy({}, {
  get(_t, prop) {
    throw new Error(`[Blocked Firestore access] Tried to use db.${String(prop)} on client. Use /api/* instead.`);
  }
}) as any;