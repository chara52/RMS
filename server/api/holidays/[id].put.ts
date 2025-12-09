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

  const id = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'IDが指定されていません',
    })
  }

  const body = await readBody(event)
  const { startDate, endDate } = body

  // バリデーション
  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      message: '必須項目が不足しています (startDate, endDate)',
    })
  }

  // 日付の妥当性チェック
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw createError({
      statusCode: 400,
      message: '日付の形式が不正です',
    })
  }

  if (start > end) {
    throw createError({
      statusCode: 400,
      message: '開始日は終了日より前である必要があります',
    })
  }

  try {
    // 更新対象のドキュメントが存在するか確認
    const docRef = adminDb.collection('reservations').doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw createError({
        statusCode: 404,
        message: '指定された休み設定が見つかりません',
      })
    }

    const docData = doc.data()
    if (docData?.info !== '休み') {
      throw createError({
        statusCode: 400,
        message: '指定されたIDは休み設定ではありません',
      })
    }

    // 重複チェック: 自分以外の休み設定と期間が重複していないか確認
    const existingHolidays = await adminDb
      .collection('reservations')
      .where('info', '==', '休み')
      .get()

    for (const existingDoc of existingHolidays.docs) {
      // 自分自身はスキップ
      if (existingDoc.id === id) {
        continue
      }

      const data = existingDoc.data()
      const existingStart = new Date(data.startDate)
      const existingEnd = new Date(data.endDate)

      // 期間の重複チェック
      if (
        (start >= existingStart && start <= existingEnd) ||
        (end >= existingStart && end <= existingEnd) ||
        (start <= existingStart && end >= existingEnd)
      ) {
        throw createError({
          statusCode: 409,
          message: '選択した期間は既に休み設定されています',
        })
      }
    }

    // 既存予約チェック: 設定しようとしている期間に既存の予約があるか確認
    const allReservations = await adminDb
      .collection('reservations')
      .where('info', '!=', '休み')
      .get()

    for (const reservationDoc of allReservations.docs) {
      const data = reservationDoc.data()
      // 予約のtime(YYYY-MM-DDTHH:mm:ss形式)から日付部分を取得
      const reservationDate = new Date(data.time.split('T')[0])

      // 予約日が休み設定期間内にあるかチェック
      if (reservationDate >= start && reservationDate <= end) {
        // 日付を「YYYY年M月D日」形式にフォーマット
        const year = reservationDate.getFullYear()
        const month = reservationDate.getMonth() + 1
        const day = reservationDate.getDate()
        const formattedDate = `${year}年${month}月${day}日`
        throw createError({
          statusCode: 409,
          message: `${formattedDate}に予約が入っているため、休み設定できません`,
        })
      }
    }

    // 休み設定を更新
    await docRef.update({
      startDate,
      endDate,
      time: `${startDate}T00:00:00`,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return {
      id,
      message: '休み設定が更新されました',
      startDate,
      endDate,
    }
  } catch (error: any) {
    // 既に createError でスローされたエラーはそのまま再スロー
    if (error.statusCode) {
      throw error
    }

    console.error('休み設定更新エラー:', error)
    throw createError({
      statusCode: 500,
      message: '休み設定の更新に失敗しました',
    })
  }
})
