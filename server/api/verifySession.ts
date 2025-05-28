import { getAuth } from 'firebase-admin/auth'
import { parseCookies } from 'h3'
import { getApps, initializeApp, cert } from 'firebase-admin/app'
import serviceAccount from '../firebase/serviceAccountKey.json'

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event)
  const sessionCookie = cookies.__session

  // クッキーがなければ401エラー
  if (!sessionCookie) {
    throw createError({ statusCode: 401, statusMessage: 'No session' })
  }

  try {
    // クッキーが有効かどうか、Firebase Admin SDKで検証
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true)
    return { user: decodedClaims }
  } catch (e) {
    // 期限切れの場合、401エラーを返す
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
  }
})
