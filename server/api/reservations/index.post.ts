import { adminDb } from '../../firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { parseCookies } from 'h3'

export default defineEventHandler(async (event) => {
  // セッション検証
  const cookies = parseCookies(event)
  const sessionCookie = cookies.__session

  if (!sessionCookie) {
    throw createError({
      statusCode: 401,
      message: 'ログインが必要です',
    })
  }

  let decodedClaims
  try {
    decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true)
  } catch (e) {
    throw createError({
      statusCode: 401,
      message: 'セッションが無効です',
    })
  }

  // ユーザー情報を取得
  const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get()
  const userData = userDoc.data()

  if (!userData) {
    throw createError({
      statusCode: 404,
      message: 'ユーザー情報が見つかりません',
    })
  }

  const body = await readBody(event)
  const { name, people, time, course, drink, info, phone, seat } = body

  // バリデーション
  if (!name || !people || !time || !phone) {
    throw createError({
      statusCode: 400,
      message: '必須項目が不足しています (name, people, time, phone)',
    })
  }

  // Firestoreに予約データを送信
  try {
    const docRef = await adminDb.collection('reservations').add({
      name,
      people,
      time,
      course: Array.isArray(course) ? course : [course || 'なし'],
      drink: Array.isArray(drink) ? drink : [drink || 'なし'],
      info: info || '',
      phone,
      seat: seat || '',
      createdBy: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        username: userData.username,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return {
      id: docRef.id,
      message: '予約が作成されました',
      createdBy: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        username: userData.username,
      },
    }
  } catch (error) {
    console.error('予約作成エラー:', error)
    throw createError({
      statusCode: 500,
      message: '予約の作成に失敗しました',
    })
  }
})
