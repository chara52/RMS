import { auth as adminAuth } from 'firebase-admin'
import { parseCookies, setCookie } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, cert, getApps } from 'firebase-admin/app'

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // ←重要
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const idToken = body.idToken
  const expiresIn = 24 * 60 * 60 * 1000 // 24時間

  try {
    // クッキーのセッションを生成
    const sessionCookie = await getAuth().createSessionCookie(idToken, {
      expiresIn,
    })

    // クッキーを設定（クッキーにセッションが含まれる形で送信）
    setCookie(event, '__session', sessionCookie, {
      httpOnly: true,
      secure: true,
      maxAge: expiresIn / 1000,
      path: '/',
      sameSite: 'lax',
    })

    return { status: 'success' }
  } catch (err) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }))
  }
})
