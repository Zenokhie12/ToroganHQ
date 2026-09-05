<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore, type SignUpFields } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const accountType = ref<'student' | 'officer'>('student')
const password = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)

const form = reactive<Omit<SignUpFields, 'password'>>({
  email: '',
  firstName: '',
  lastName: '',
  birthday: '',
  address: '',
  college: '',
  yearLevel: '',
  cor: '',
})

async function submit() {
  submitting.value = true
  error.value = null
  try {
    const fields: SignUpFields = { ...form, password: password.value }
    if (accountType.value === 'student') {
      await authStore.signUpStudent(fields)
      router.replace({ name: 'student' })
    } else {
      await authStore.signUpOfficer(fields)
      router.replace({ name: 'pending-approval' })
    }
  } catch {
    error.value = 'Could not create your account. The email may already be in use.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 py-12">
    <h1 class="text-2xl font-bold text-brand-900">Create an account</h1>

    <div class="mt-4 flex gap-2">
      <button
        type="button"
        @click="accountType = 'student'"
        class="flex-1 rounded-md border px-3 py-2 text-sm font-medium"
        :class="accountType === 'student' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-brand-200 text-brand-500'"
      >
        Student resident
      </button>
      <button
        type="button"
        @click="accountType = 'officer'"
        class="flex-1 rounded-md border px-3 py-2 text-sm font-medium"
        :class="accountType === 'officer' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-brand-200 text-brand-500'"
      >
        Monitoring officer
      </button>
    </div>
    <p v-if="accountType === 'officer'" class="mt-2 text-xs text-brand-500">
      Officer accounts require Management approval before you can log in.
    </p>

    <form @submit.prevent="submit" class="mt-6 space-y-4">
      <p v-if="error" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error }}</p>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-brand-700">First name</label>
          <input v-model="form.firstName" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-brand-700">Last name</label>
          <input v-model="form.lastName" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-brand-700">Email</label>
        <input v-model="form.email" type="email" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-brand-700">Password</label>
        <input v-model="password" type="password" minlength="6" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-brand-700">Birthday</label>
        <input v-model="form.birthday" type="date" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-brand-700">Address</label>
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
        <label class="block text-sm font-medium text-brand-700">COR number</label>
        <input v-model="form.cor" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {{ submitting ? 'Creating account…' : 'Create account' }}
      </button>
    </form>

    <p class="mt-4 text-center text-sm text-brand-500">
      Already have an account?
      <RouterLink to="/login" class="font-medium text-brand-700 hover:underline">Log in</RouterLink>
    </p>
  </div>
</template>
