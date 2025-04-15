// plugins/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAXJXhNbj2erK0soZ-a5sGSlBN94XkfQW8',
  authDomain: 'rms-user-45040.firebaseapp.com',
  projectId: 'rms-user-45040',
  storageBucket: 'rms-user-45040.firebasestorage.app',
  messagingSenderId: '76167590270',
  appId: '1:76167590270:web:012183941ed9f3ea24c32f',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default defineNuxtPlugin(() => {
  return {
    provide: {
      auth,
      db,
    },
  }
})
