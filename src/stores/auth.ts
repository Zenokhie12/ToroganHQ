import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { Role, UserProfile } from '@/types/models'

export interface SignUpFields {
  email: string
  password: string
  firstName: string
  lastName: string
  birthday: string
  address: string
  college: string
  yearLevel: string
  cor: string
}

export const useAuthStore = defineStore('auth', () => {
  const firebaseUser = ref<FirebaseUser | null>(null)
  const profile = ref<UserProfile | null>(null)
  // Flips true once the initial onAuthStateChanged callback has resolved
  // (including the Firestore profile fetch), so router guards know when
  // it's safe to make an allow/deny decision instead of racing Firebase's
  // async session restore on page load.
  const ready = ref(false)

  const isSignedIn = computed(() => firebaseUser.value !== null)
  const role = computed<Role | null>(() => profile.value?.role ?? null)
  const isApproved = computed(() => profile.value?.status === 'approved')

  async function fetchProfile(uid: string) {
    const snap = await getDoc(doc(db, 'users', uid))
    profile.value = snap.exists() ? (snap.data() as UserProfile) : null
  }

  function init() {
    onAuthStateChanged(auth, async (user) => {
      firebaseUser.value = user
      profile.value = user ? profile.value : null
      if (user) {
        await fetchProfile(user.uid)
      }
      ready.value = true
    })
  }

  // These resolve only once profile.value reflects the signed-in user, so
  // callers (e.g. LoginView) can safely read role/isApproved right after
  // awaiting them instead of racing the async onAuthStateChanged listener.
  async function signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    firebaseUser.value = cred.user
    await fetchProfile(cred.user.uid)
  }

  async function signUpStudent(fields: SignUpFields) {
    const cred = await createUserWithEmailAndPassword(auth, fields.email, fields.password)
    firebaseUser.value = cred.user
    await createProfileDoc(cred.user.uid, fields, 'student', 'approved')
    await fetchProfile(cred.user.uid)
  }

  async function signUpOfficer(fields: SignUpFields) {
    const cred = await createUserWithEmailAndPassword(auth, fields.email, fields.password)
    firebaseUser.value = cred.user
    await createProfileDoc(cred.user.uid, fields, 'officer', 'pending')
    await fetchProfile(cred.user.uid)
  }

  async function createProfileDoc(
    uid: string,
    fields: SignUpFields,
    role: Role,
    status: 'approved' | 'pending',
  ) {
    await setDoc(doc(db, 'users', uid), {
      uid,
      email: fields.email,
      role,
      status,
      firstName: fields.firstName,
      lastName: fields.lastName,
      birthday: fields.birthday,
      address: fields.address,
      college: fields.college,
      yearLevel: fields.yearLevel,
      cor: fields.cor,
      roomNumber: null,
      merits: 0,
      demerits: 0,
      penalties: 0,
      standing: 'good',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function signOut() {
    await firebaseSignOut(auth)
    profile.value = null
  }

  return {
    firebaseUser,
    profile,
    ready,
    isSignedIn,
    role,
    isApproved,
    init,
    signIn,
    signUpStudent,
    signUpOfficer,
    signOut,
  }
})
