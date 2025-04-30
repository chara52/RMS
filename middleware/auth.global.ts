export default defineNuxtRouteMiddleware((to, from) => {
  const user = useState('user')

  // userがいない && /loginや/signupではないページに行こうとしたら
  if (!user.value && to.path !== '/' && to.path !== '/Signup') {
    return navigateTo('/')
  }
})
