export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useState('user')
  // ブラウザのクッキーを取得
  const cookie = useRequestHeaders(['cookie'])?.cookie || ''

  if (!user.value) {
    try {
      // クッキーをverifySessionAPIに送信
      const res = await $fetch('/api/verifySession', {
        headers: { cookie },
      })
      user.value = res.user
    } catch {
      if (to.path !== '/' && to.path !== '/Signup') {
        return navigateTo('/')
      }
    }
  }
})
