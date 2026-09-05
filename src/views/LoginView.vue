<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { dashboardRouteForRole } from '@/router'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)

async function submit() {
  submitting.value = true
  error.value = null
  try {
    await authStore.signIn(email.value, password.value)
    const redirect = route.query.redirect
    router.replace(typeof redirect === 'string' ? redirect : dashboardRouteForRole(authStore.role))
  } catch {
    error.value = 'Invalid email or password.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm px-4 py-16">
    <h1 class="text-2xl font-bold text-brand-900">Log in</h1>

    <form @submit.prevent="submit" class="mt-6 space-y-4">
      <p v-if="error" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error }}</p>

      <div>
        <label class="block text-sm font-medium text-brand-700">Email</label>
        <input v-model="email" type="email" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-brand-700">Password</label>
        <input v-model="password" type="password" required class="mt-1 w-full rounded-md border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {{ submitting ? 'Logging in…' : 'Log in' }}
      </button>
    </form>

    <p class="mt-4 text-center text-sm text-brand-500">
      No account?
      <RouterLink to="/signup" class="font-medium text-brand-700 hover:underline">Sign up</RouterLink>
    </p>
  </div>
</template>
