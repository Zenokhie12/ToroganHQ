<script setup lang="ts">
import { ref, reactive } from 'vue'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { computeStanding } from '@/utils/standing'
import type { Room, UserProfile } from '@/types/models'

defineProps<{
  rooms: Room[]
}>()

// Occupant profiles are only fetched the first time a room is opened —
// keeps this screen's reads proportional to rooms actually clicked rather
// than the whole roster, which matters on the Spark plan's 50k reads/day.
const occupantsByRoom = reactive<Record<string, UserProfile[]>>({})
const loadingRoom = ref<string | null>(null)
const openRoomId = ref<string | null>(null)
const selectedOccupant = ref<UserProfile | null>(null)
const savingUid = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

async function toggleRoom(room: Room) {
  errorMessage.value = null
  if (openRoomId.value === room.roomNumber) {
    openRoomId.value = null
    return
  }

  openRoomId.value = room.roomNumber
  selectedOccupant.value = null

  if (!occupantsByRoom[room.roomNumber]) {
    loadingRoom.value = room.roomNumber
    try {
      const snaps = await Promise.all(
        room.occupantIds.map((uid) => getDoc(doc(db, 'users', uid))),
      )
      occupantsByRoom[room.roomNumber] = snaps
        .filter((snap) => snap.exists())
        .map((snap) => snap.data() as UserProfile)
    } catch {
      errorMessage.value = `Could not load occupants for room ${room.roomNumber}.`
    } finally {
      loadingRoom.value = null
    }
  }
}

function selectOccupant(profile: UserProfile) {
  selectedOccupant.value = profile
}

async function applyDelta(field: 'merits' | 'demerits', delta: number) {
  const profile = selectedOccupant.value
  if (!profile || savingUid.value) return

  const merits = field === 'merits' ? Math.max(0, profile.merits + delta) : profile.merits
  const demerits = field === 'demerits' ? Math.max(0, profile.demerits + delta) : profile.demerits
  const { penalties, standing } = computeStanding(merits, demerits)

  savingUid.value = profile.uid
  errorMessage.value = null
  try {
    await updateDoc(doc(db, 'users', profile.uid), {
      merits,
      demerits,
      penalties,
      standing,
      updatedAt: serverTimestamp(),
    })
    // Reflect the write locally so the UI doesn't wait on a re-read.
    profile.merits = merits
    profile.demerits = demerits
    profile.penalties = penalties
    profile.standing = standing
  } catch {
    errorMessage.value = 'Failed to save that change. Please try again.'
  } finally {
    savingUid.value = null
  }
}
</script>

<template>
  <div>
    <p v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      <button
        v-for="room in rooms"
        :key="room.roomNumber"
        type="button"
        @click="toggleRoom(room)"
        class="flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-semibold transition"
        :class="
          openRoomId === room.roomNumber
            ? 'border-brand-600 bg-brand-600 text-white shadow-md'
            : 'border-brand-200 bg-white text-brand-900 hover:border-brand-400 hover:bg-brand-50'
        "
      >
        <span>Room {{ room.roomNumber }}</span>
        <span
          class="mt-1 text-xs font-normal"
          :class="openRoomId === room.roomNumber ? 'text-brand-100' : 'text-brand-500'"
        >
          {{ room.occupantIds.length }}/{{ room.capacity }}
        </span>
      </button>
    </div>

    <div v-if="openRoomId" class="mt-6 rounded-xl border border-brand-200 bg-white p-5">
      <h3 class="text-lg font-semibold text-brand-900">Room {{ openRoomId }} occupants</h3>

      <p v-if="loadingRoom === openRoomId" class="mt-3 text-sm text-brand-500">Loading occupants…</p>

      <ul v-else-if="occupantsByRoom[openRoomId]?.length" class="mt-3 divide-y divide-brand-100">
        <li v-for="occupant in occupantsByRoom[openRoomId]" :key="occupant.uid">
          <button
            type="button"
            @click="selectOccupant(occupant)"
            class="flex w-full items-center justify-between py-2 text-left hover:bg-brand-50"
          >
            <span>{{ occupant.firstName }} {{ occupant.lastName }}</span>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="{
                'bg-green-100 text-green-700': occupant.standing === 'good',
                'bg-amber-100 text-amber-700': occupant.standing === 'warning',
                'bg-red-100 text-red-700': occupant.standing === 'termination',
              }"
            >
              {{ occupant.merits }}M / {{ occupant.demerits }}D
            </span>
          </button>
        </li>
      </ul>

      <p v-else class="mt-3 text-sm text-brand-500">This room has no occupants on file.</p>
    </div>

    <div
      v-if="selectedOccupant"
      class="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4"
      @click.self="selectedOccupant = null"
    >
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div class="flex items-start justify-between">
          <h3 class="text-lg font-semibold text-brand-900">
            {{ selectedOccupant.firstName }} {{ selectedOccupant.lastName }}
          </h3>
          <button type="button" @click="selectedOccupant = null" class="text-brand-400 hover:text-brand-700">
            ✕
          </button>
        </div>

        <dl class="mt-4 space-y-1 text-sm text-brand-700">
          <div class="flex justify-between"><dt>Room</dt><dd>{{ selectedOccupant.roomNumber }}</dd></div>
          <div class="flex justify-between"><dt>College &amp; Year</dt><dd>{{ selectedOccupant.college }} · {{ selectedOccupant.yearLevel }}</dd></div>
          <div class="flex justify-between"><dt>Birthday</dt><dd>{{ selectedOccupant.birthday }}</dd></div>
          <div class="flex justify-between"><dt>Address</dt><dd>{{ selectedOccupant.address }}</dd></div>
          <div class="flex justify-between"><dt>COR</dt><dd>{{ selectedOccupant.cor }}</dd></div>
        </dl>

        <div
          v-if="selectedOccupant.standing !== 'good'"
          class="mt-4 rounded-lg px-3 py-2 text-sm font-medium"
          :class="
            selectedOccupant.standing === 'termination'
              ? 'bg-red-50 text-red-700'
              : 'bg-amber-50 text-amber-700'
          "
        >
          {{ selectedOccupant.standing === 'termination'
            ? `Residency termination alert — ${selectedOccupant.penalties} penalties.`
            : `Mandatory Management counseling warning — ${selectedOccupant.penalties} penalties.` }}
        </div>

        <div class="mt-5 grid grid-cols-2 gap-4">
          <div class="rounded-lg border border-brand-100 p-3 text-center">
            <p class="text-xs uppercase tracking-wide text-brand-400">Merits</p>
            <p class="text-2xl font-semibold text-brand-900">{{ selectedOccupant.merits }}</p>
            <div class="mt-2 flex justify-center gap-2">
              <button
                type="button"
                :disabled="savingUid === selectedOccupant.uid"
                @click="applyDelta('merits', -1)"
                class="rounded-md bg-brand-100 px-3 py-1 text-brand-700 hover:bg-brand-200 disabled:opacity-50"
              >−</button>
              <button
                type="button"
                :disabled="savingUid === selectedOccupant.uid"
                @click="applyDelta('merits', 1)"
                class="rounded-md bg-brand-600 px-3 py-1 text-white hover:bg-brand-700 disabled:opacity-50"
              >+</button>
            </div>
          </div>

          <div class="rounded-lg border border-brand-100 p-3 text-center">
            <p class="text-xs uppercase tracking-wide text-brand-400">Demerits</p>
            <p class="text-2xl font-semibold text-brand-900">{{ selectedOccupant.demerits }}</p>
            <div class="mt-2 flex justify-center gap-2">
              <button
                type="button"
                :disabled="savingUid === selectedOccupant.uid"
                @click="applyDelta('demerits', -1)"
                class="rounded-md bg-brand-100 px-3 py-1 text-brand-700 hover:bg-brand-200 disabled:opacity-50"
              >−</button>
              <button
                type="button"
                :disabled="savingUid === selectedOccupant.uid"
                @click="applyDelta('demerits', 1)"
                class="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
              >+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
