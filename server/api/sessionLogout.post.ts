// server/api/sessionLogout.post.ts
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  // クッキー削除（有効期限を過去に）
  setCookie(event, '__session', '', {
    maxAge: 0,
    path: '/',
  })

  return { status: 'logged_out' }
})
