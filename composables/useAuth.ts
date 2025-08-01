import { auth, db } from '../plugins/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore'

export const useAuth = () => {
  const user = useState('user', () => null)

  //FireauthとFirestoreは独立している
  const signup = async (email: string, password: string, username: string) => {
    //Firebase Authenticationにアカウントを作成している
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    user.value = cred.user

    // サーバー側からFirestoreへ保存をしている
    await $fetch('/api/SaveUser', {
      method: 'POST',
      body: {
        uid: cred.user.uid,
        email: cred.user.email,
        username,
      },
    })
  }

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    user.value = cred.user

    // サーバーサイドからIDトークンを取得
    const idToken = await cred.user.getIdToken()

    // APIにセッション作成をリクエスト、IDトークンをPOST
    await $fetch('/api/sessionLogin', {
      method: 'POST',
      body: { idToken },
    })
  }

  const logout = async () => {
    await signOut(auth)
    user.value = null

    //以下を追加
    await $fetch('/api/sessionLogout', {
      method: 'POST',
    })
  }

  // 認証状態の保持
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser
  })

  return {
    user,
    signup,
    login,
    logout,
  }
}
