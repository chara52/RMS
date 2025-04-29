// /server/firebase/admin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import serviceAccount from './serviceAccountKey.json' // パスは適宜調整

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

export const adminDb = getFirestore()
