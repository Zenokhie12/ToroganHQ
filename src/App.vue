<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { dashboardRouteForRole } from '@/router'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-brand-50/40">
    <header class="border-b border-brand-100 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <RouterLink to="/" class="font-bold text-brand-900">ToroganHQ</RouterLink>

        <nav class="flex items-center gap-4 text-sm">
          <RouterLink to="/rules" class="text-brand-600 hover:text-brand-900">Rules</RouterLink>
          <RouterLink to="/apply" class="text-brand-600 hover:text-brand-900">Apply</RouterLink>

          <template v-if="authStore.isSignedIn">
            <RouterLink :to="dashboardRouteForRole(authStore.role)" class="text-brand-600 hover:text-brand-900">
              Dashboard
            </RouterLink>
            <button type="button" @click="authStore.signOut()" class="text-brand-600 hover:text-brand-900">
              Log out
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="text-brand-600 hover:text-brand-900">Log in</RouterLink>
          </template>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>
