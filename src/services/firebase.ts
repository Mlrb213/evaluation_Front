import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

export const isFirebaseConfigured = () =>
  Object.values(firebaseConfig).every((value) => Boolean(value))

let app: FirebaseApp | null = null
let authInstance: ReturnType<typeof getAuth> | null = null
let databaseInstance: Database | null = null

if (isFirebaseConfigured() && getApps().length === 0) {
  app = initializeApp(firebaseConfig)
  authInstance = getAuth(app)
  databaseInstance = getDatabase(app)
}

export const auth = authInstance
export const database = databaseInstance

export const getCurrentUser = () => auth?.currentUser ?? null

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null)
    return () => undefined
  }

  return onAuthStateChanged(auth, callback)
}

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
}
