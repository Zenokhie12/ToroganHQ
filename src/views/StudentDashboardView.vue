<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const profile = computed(() => authStore.profile)
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-10">
    <h1 class="text-2xl font-bold text-brand-900">My profile</h1>
    <p class="mt-1 text-sm text-brand-500">Read-only — contact a Monitoring Officer to correct any details.</p>

    <div v-if="profile" class="mt-6 rounded-xl border border-brand-200 bg-white p-6">
      <dl class="grid grid-cols-2 gap-4 text-sm">
        <div><dt class="text-brand-400">Name</dt><dd class="font-medium text-brand-900">{{ profile.firstName }} {{ profile.lastName }}</dd></div>
        <div><dt class="text-brand-400">Room</dt><dd class="font-medium text-brand-900">{{ profile.roomNumber ?? 'Unassigned' }}</dd></div>
        <div><dt class="text-brand-400">Birthday</dt><dd class="font-medium text-brand-900">{{ profile.birthday }}</dd></div>
        <div><dt class="text-brand-400">College &amp; Year</dt><dd class="font-medium text-brand-900">{{ profile.college }} · {{ profile.yearLevel }}</dd></div>
        <div class="col-span-2"><dt class="text-brand-400">Address</dt><dd class="font-medium text-brand-900">{{ profile.address }}</dd></div>
        <div><dt class="text-brand-400">COR</dt><dd class="font-medium text-brand-900">{{ profile.cor }}</dd></div>
      </dl>

      <div class="mt-6 grid grid-cols-2 gap-4 border-t border-brand-100 pt-4 text-center">
        <div>
          <p class="text-xs uppercase tracking-wide text-brand-400">Merits</p>
          <p class="text-2xl font-semibold text-brand-900">{{ profile.merits }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-brand-400">Demerits</p>
          <p class="text-2xl font-semibold text-brand-900">{{ profile.demerits }}</p>
        </div>
      </div>

      <div
        v-if="profile.standing !== 'good'"
        class="mt-4 rounded-lg px-3 py-2 text-sm font-medium"
        :class="profile.standing === 'termination' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'"
      >
        {{ profile.standing === 'termination'
          ? `Residency termination alert — ${profile.penalties} penalties on record.`
          : `Mandatory Management counseling warning — ${profile.penalties} penalties on record.` }}
      </div>
    </div>
  </div>
</template>
