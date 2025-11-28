import { adminDb } from '../../firebase/admin'
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

  const id = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'IDが指定されていません',
    })
  }

  try {
    // 削除対象のドキュメントが存在するか確認
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

    // 休み設定を削除
    await docRef.delete()

    return {
      id,
      message: '休み設定が削除されました',
    }
  } catch (error: any) {
    // 既に createError でスローされたエラーはそのまま再スロー
    if (error.statusCode) {
      throw error
    }

    console.error('休み設定削除エラー:', error)
    throw createError({
      statusCode: 500,
      message: '休み設定の削除に失敗しました',
    })
  }
})
