import { adminDb } from '../../../firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { parseCookies } from 'h3'

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event)
  const sessionCookie = cookies.__session

  if (!sessionCookie) {
    throw createError({
      statusCode: 401,
      message: 'ログインが必要です',
    })
  }

  try {
    await getAuth().verifySessionCookie(sessionCookie, true)
  } catch (e) {
    throw createError({
      statusCode: 401,
      message: 'セッションが無効です',
    })
  }

  const reservationId = event.context.params?.id

  if (!reservationId) {
    throw createError({
      statusCode: 400,
      message: '予約IDが必要です',
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

  // Firestoreの予約データを更新
  try {
    const docRef = adminDb.collection('reservations').doc(reservationId)
    await docRef.update({
      name,
      people,
      time,
      course: Array.isArray(course) ? course : [course || 'なし'],
      drink: Array.isArray(drink) ? drink : [drink || 'なし'],
      info: info || '',
      phone,
      seat: seat || '',
      updatedAt: FieldValue.serverTimestamp(),
    })

    return {
      id: docRef.id,
      message: '予約が更新されました',
    }
  } catch (error) {
    console.error('予約更新エラー:', error)
    throw createError({
      statusCode: 500,
      message: '予約の更新に失敗しました',
    })
  }
})
