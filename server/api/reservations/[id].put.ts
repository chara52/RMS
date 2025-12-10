import { adminDb } from '../../firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'
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

    const body = await readBody(event)
    const { name, people, time, course, drink, info, phone, seat } = body

    if (!name || !people || !time || !phone) {
      throw createError({
        statusCode: 400,
        message: '必須項目が不足しています',
      })
    }

    const docRef = adminDb.collection('reservations').doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw createError({
        statusCode: 404,
        message: '予約が見つかりません',
      })
    }

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
      id,
      message: '予約が更新されました',
    }
  } catch (error: any) {
    console.error('予約更新エラー:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '予約の更新に失敗しました',
    })
  }
})

