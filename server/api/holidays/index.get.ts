import { adminDb } from '../../firebase/admin'

export default defineEventHandler(async (event) => {
  try {
    const snapshot = await adminDb
      .collection('reservations')
      .where('info', '==', '休み')
      .get()

    const holidays = snapshot.docs
      .map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          startDate: data.startDate,
          endDate: data.endDate,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString(),
        }
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate))

    return { holidays }
  } catch (error) {
    console.error('休み設定取得エラー:', error)
    throw createError({
      statusCode: 500,
      message: '休み設定の取得に失敗しました'
    })
  }
})
