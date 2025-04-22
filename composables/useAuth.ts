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

  //Firestoreのユーザーネームからメールアドレスを取得
  const getEmailByUsername = async (username: string): Promise<string | null> => {
    const q = query(collection(db, 'users'), where('username', '==', username))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return snapshot.docs[0].data().email || null
  }

  //Firestoreから取得してきたメールアドレスでFirebase Authenticationにログイン
  const loginWithUsername = async (username: string, password: string) => {
    const email = await getEmailByUsername(username)
    if (!email) throw new Error('ユーザーネームが存在しません')
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
    //login,
    loginWithUsername,
    logout,
  }
}
