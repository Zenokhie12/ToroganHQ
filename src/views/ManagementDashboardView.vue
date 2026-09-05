<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/types/models'

const pendingOfficers = ref<UserProfile[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const savingUid = ref<string | null>(null)

async function loadPending() {
  loading.value = true
  error.value = null
  try {
    const snap = await getDocs(
      query(collection(db, 'users'), where('role', '==', 'officer'), where('status', '==', 'pending')),
    )
    pendingOfficers.value = snap.docs.map((d) => d.data() as UserProfile)
  } catch {
    error.value = 'Could not load pending officer accounts.'
  } finally {
    loading.value = false
  }
}

async function decide(officer: UserProfile, status: 'approved' | 'rejected') {
  savingUid.value = officer.uid
  try {
    await updateDoc(doc(db, 'users', officer.uid), { status })
    pendingOfficers.value = pendingOfficers.value.filter((o) => o.uid !== officer.uid)
  } catch {
    error.value = 'Could not save that decision. Please try again.'
  } finally {
    savingUid.value = null
  }
}

onMounted(loadPending)
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="text-2xl font-bold text-brand-900">Pending officer approvals</h1>
    <p class="mt-1 text-sm text-brand-500">New Monitoring Officer accounts wait here until approved.</p>

    <p v-if="loading" class="mt-6 text-sm text-brand-500">Loading…</p>
    <p v-else-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="!pendingOfficers.length" class="mt-6 text-sm text-brand-500">No pending accounts.</p>

    <ul v-else class="mt-6 space-y-3">
      <li
        v-for="officer in pendingOfficers"
        :key="officer.uid"
        class="flex items-center justify-between rounded-xl border border-brand-200 bg-white p-4"
      >
        <div>
          <p class="font-medium text-brand-900">{{ officer.firstName }} {{ officer.lastName }}</p>
          <p class="text-sm text-brand-500">{{ officer.email }}</p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            :disabled="savingUid === officer.uid"
            @click="decide(officer, 'rejected')"
            class="rounded-md bg-brand-100 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-200 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            :disabled="savingUid === officer.uid"
            @click="decide(officer, 'approved')"
            class="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
