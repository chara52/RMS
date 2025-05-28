// server/api/sessionLogin.post.ts
import { auth as adminAuth } from 'firebase-admin'
import { parseCookies, setCookie } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import serviceAccount from '../firebase/serviceAccountKey.json'

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const idToken = body.idToken
  const expiresIn = 24 * 60 * 60 * 1000 // 5分

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
