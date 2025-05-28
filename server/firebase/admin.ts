// /server/firebase/admin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createRequire } from 'module'
// 以下を追加
import path from 'path'
const require = createRequire(import.meta.url)
// プロジェクトルートを基準にパスを設定
const serviceAccount = require(path.resolve('server/firebase/serviceAccountKey.json'))
//import { serviceAccount } from '/server/firebase/serviceAccountKey.json'

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

export const adminDb = getFirestore()
