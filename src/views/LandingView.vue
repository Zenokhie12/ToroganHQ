<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16 text-center">
    <h1 class="text-3xl font-bold text-brand-900 sm:text-4xl">Welcome home, Torogan.</h1>
    <p class="mx-auto mt-4 max-w-xl text-brand-600">
      Torogan Hall has been a home away from home for generations of residents — a place to
      study, grow, and look out for one another. We're glad you're here.
    </p>

    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <RouterLink to="/apply" class="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
        Apply for residency
      </RouterLink>
      <RouterLink to="/rules" class="rounded-md border border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
        Rules &amp; conditions
      </RouterLink>
      <RouterLink to="/login" class="rounded-md border border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
        Log in
      </RouterLink>
    </div>
  </div>
</template>
