import { adminDb } from '../firebase/admin'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { uid, email, username } = body

  if (!uid || !email || !username) {
    throw createError({ statusCode: 400, message: 'Missing fields' })
  }

  await adminDb.collection('users').doc(uid).set({
    email,
    username,
    createdAt: new Date(),
  })

  return { message: 'User saved successfully' }
})
