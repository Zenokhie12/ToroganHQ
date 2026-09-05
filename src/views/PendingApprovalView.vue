<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-20 text-center">
    <h1 class="text-2xl font-bold text-brand-900">Awaiting approval</h1>
    <p class="mt-3 text-sm text-brand-600">
      Your Monitoring Officer account has been created but still needs to be approved by
      Management before you can access the room dashboard. Check back soon.
    </p>
    <button
      type="button"
      @click="authStore.signOut()"
      class="mt-6 rounded-md border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
    >
      Log out
    </button>
  </div>
</template>
