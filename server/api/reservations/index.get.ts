import { adminDb } from '../../firebase/admin'

export default defineEventHandler(async (event) => {
  try {
    const snapshot = await adminDb.collection('reservations').get()

    const reservations = snapshot.docs.map(doc => {
      const data = doc.data()
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
    })

    return { reservations }
  } catch (error) {
    console.error('予約取得エラー:', error)
    throw createError({
      statusCode: 500,
      message: '予約データの取得に失敗しました'
    })
  }
})
