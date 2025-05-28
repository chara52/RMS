export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useState('user')
  // 以下を追加
  // ブラウザのクッキーを取得
  const cookie = useRequestHeaders(['cookie'])?.cookie || ''

  // userがいない && /loginや/signupではないページに行こうとしたら
  /*if (!user.value && to.path !== '/' && to.path !== '/Signup') {
    return navigateTo('/')
  }*/

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
