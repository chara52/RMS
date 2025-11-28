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

  // 重複チェック: 既存の休み設定と期間が重複していないか確認
  try {
    const existingHolidays = await adminDb
      .collection('reservations')
      .where('info', '==', '休み')
      .get()

    for (const doc of existingHolidays.docs) {
      const data = doc.data()
      const existingStart = new Date(data.startDate)
      const existingEnd = new Date(data.endDate)

      // 期間の重複チェック
      // 新規期間の開始日が既存期間内、または新規期間の終了日が既存期間内、または新規期間が既存期間を包含
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

    // Firestoreに休み設定を保存
    const docRef = await adminDb.collection('reservations').add({
      startDate,
      endDate,
      info: '休み',
      // 既存の予約データとの互換性のため、ダミー値を設定
      name: '-',
      people: '-',
      time: `${startDate}T00:00:00`,
      seat: '-',
      course: ['-'],
      drink: ['-'],
      phone: '-',
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
      message: '休み設定が作成されました',
      startDate,
      endDate,
      createdBy: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        username: userData.username,
      },
    }
  } catch (error: any) {
    // 既に createError でスローされたエラーはそのまま再スロー
    if (error.statusCode) {
      throw error
    }

    console.error('休み設定作成エラー:', error)
    throw createError({
      statusCode: 500,
      message: '休み設定の作成に失敗しました',
    })
  }
})
