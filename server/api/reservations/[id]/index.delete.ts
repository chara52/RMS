import { adminDb } from '../../../firebase/admin'
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

  try {
    const docRef = adminDb.collection('reservations').doc(reservationId)
    await docRef.delete()

    return {
      id: reservationId,
      message: '予約が削除されました',
    }
  } catch (error) {
    console.error('予約削除エラー:', error)
    throw createError({
      statusCode: 500,
      message: '予約の削除に失敗しました',
    })
  }
})
