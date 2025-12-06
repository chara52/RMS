import { adminDb } from '../../firebase/admin'
import { getAuth } from 'firebase-admin/auth'
import { parseCookies } from 'h3'

export default defineEventHandler(async (event) => {
  try {
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

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'IDが指定されていません',
      })
    }

    const doc = await adminDb.collection('reservations').doc(id).get()

    if (!doc.exists) {
      throw createError({
        statusCode: 404,
        message: '予約が見つかりません',
      })
    }

    await adminDb.collection('reservations').doc(id).delete()

    return {
      id,
      message: '予約が削除されました',
    }
  } catch (error: any) {
    console.error('予約削除エラー:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '予約の削除に失敗しました',
    })
  }
})

