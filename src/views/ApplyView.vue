<script setup lang="ts">
import { reactive, ref } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  birthday: '',
  address: '',
  college: '',
  yearLevel: '',
  message: '',
})

const submitting = ref(false)
const submitted = ref(false)
const error = ref<string | null>(null)

async function submit() {
  submitting.value = true
  error.value = null
  try {
    await addDoc(collection(db, 'applications'), {
      ...form,
      status: 'pending',
      submittedAt: serverTimestamp(),
      reviewedBy: null,
      reviewedAt: null,
    })
    submitted.value = true
  } catch {
    error.value = 'Something went wrong submitting your application. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-12">
    <h1 class="text-2xl font-bold text-brand-900">Application for residency</h1>

    <div v-if="submitted" class="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
      Thank you! Your application has been submitted for review.
    </div>

    <form v-else @submit.prevent="submit" class="mt-6 space-y-4">
      <p v-if="error" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error }}</p>

      <div>
        <label class="block text-sm font-medium text-brand-700">Full name</label>
        <input v-model="form.fullName" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-brand-700">Email</label>
        <input v-model="form.email" type="email" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-brand-700">Phone</label>
        <input v-model="form.phone" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-brand-700">Birthday</label>
        <input v-model="form.birthday" type="date" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-brand-700">Home address</label>
        <input v-model="form.address" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-brand-700">College</label>
          <input v-model="form.college" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-brand-700">Year level</label>
          <input v-model="form.yearLevel" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-brand-700">Anything else you'd like us to know?</label>
        <textarea v-model="form.message" rows="3" class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"></textarea>
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {{ submitting ? 'Submitting…' : 'Submit application' }}
      </button>
    </form>
  </div>
</template>
