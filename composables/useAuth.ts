// composables/useAuth.ts
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
    // Firestore にユーザーデータを保存
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: cred.user.email,
      username: username,
      createdAt: new Date(),
    })
  }

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    user.value = cred.user
  }

  const logout = async () => {
    await signOut(auth)
    user.value = null
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
