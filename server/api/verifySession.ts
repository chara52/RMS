import { getAuth } from 'firebase-admin/auth'
import { parseCookies } from 'h3'
import { getApps, initializeApp, cert } from 'firebase-admin/app'

const serviceAccount = {
  type: process.env.MY_FIREBASE_TYPE,
  project_id: process.env.MY_FIREBASE_PROJECT_ID,
  private_key_id: process.env.MY_FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.MY_FIREBASE_PRIVATE_KEY,
  client_email: process.env.MY_FIREBASE_CLIENT_EMAIL,
  client_id: process.env.MY_FIREBASE_CLIENT_ID,
  auth_uri: process.env.MY_FIREBASE_AUTH_URI,
  token_uri: process.env.MY_FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.MY_FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.MY_FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.MY_FIREBASE_UNIVERSE_DOMAIN,
}

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
