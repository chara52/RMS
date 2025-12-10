import { adminDb } from '../../firebase/admin'

export default defineEventHandler(async (event) => {
  try {
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

    const data = doc.data()
    if (!data) {
      throw createError({
        statusCode: 404,
        message: '予約データが取得できません',
      })
    }

    return {
      id: doc.id,
      name: data.name,
      people: data.people,
      time: data.time,
      course: data.course,
      drink: data.drink,
      info: data.info,
      phone: data.phone,
      seat: data.seat,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    }
  } catch (error) {
    console.error('予約取得エラー:', error)
    throw createError({
      statusCode: 500,
      message: '予約データの取得に失敗しました',
    })
  }
})
