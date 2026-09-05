<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import RoomGrid from '@/components/officer/RoomGrid.vue'
import type { Room } from '@/types/models'

const rooms = ref<Room[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const snap = await getDocs(query(collection(db, 'rooms'), orderBy('roomNumber')))
    rooms.value = snap.docs.map((d) => d.data() as Room)
  } catch {
    error.value = 'Could not load the room list.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10">
    <h1 class="text-2xl font-bold text-brand-900">Room grid</h1>
    <p class="mt-1 text-sm text-brand-500">Click a room to view occupants, then click a resident to adjust standing.</p>

    <p v-if="loading" class="mt-6 text-sm text-brand-500">Loading rooms…</p>
    <p v-else-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="!rooms.length" class="mt-6 text-sm text-brand-500">No rooms have been set up yet.</p>
    <RoomGrid v-else class="mt-6" :rooms="rooms" />
  </div>
</template>
