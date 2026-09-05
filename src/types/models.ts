import type { Timestamp } from 'firebase/firestore'

export type Role = 'student' | 'officer' | 'management'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type Standing = 'good' | 'warning' | 'termination'

/**
 * Collection: users/{uid}
 * Document ID == Firebase Auth UID.
 *
 * Students are written once at sign-up (status: 'approved' immediately —
 * there is no gate for students) and are read-only from then on: security
 * rules block students from writing to their own doc at all. Officers are
 * written once at sign-up with status: 'pending' and cannot log into the
 * officer dashboard until a management user flips status to 'approved'.
 * Management accounts cannot be self-registered (see firestore.rules) and
 * must be seeded by hand once in the Firebase console.
 */
export interface UserProfile {
  uid: string
  email: string
  role: Role
  status: ApprovalStatus

  firstName: string
  lastName: string
  birthday: string // ISO date string, e.g. "2003-05-14"
  address: string
  college: string
  yearLevel: string
  cor: string // Certificate of Registration no.

  roomNumber: string | null // denormalized copy of rooms/{roomNumber}.occupantIds membership

  merits: number
  demerits: number
  // Derived from merits/demerits by src/utils/standing.ts, recomputed and
  // persisted on every officer/management write so the student dashboard
  // (which cannot itself compute anything protected) can read them directly.
  penalties: number
  standing: Standing

  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Collection: rooms/{roomNumber}
 * Document ID == room number, e.g. "60".
 */
export interface Room {
  roomNumber: string
  capacity: number
  occupantIds: string[] // uids, each cross-referencing a users/{uid} doc
}

/**
 * Collection: applications/{applicationId}
 * Publicly writable (create-only) so guests can submit the residency form
 * without an account; only management can read/triage submissions.
 */
export interface Application {
  fullName: string
  email: string
  phone: string
  birthday: string
  address: string
  college: string
  yearLevel: string
  message: string
  status: ApprovalStatus
  submittedAt: Timestamp
  reviewedBy: string | null
  reviewedAt: Timestamp | null
}
