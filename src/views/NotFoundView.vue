<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="mx-auto max-w-md px-4 py-20 text-center">
    <h1 class="text-2xl font-bold text-brand-900">Page not found</h1>
    <RouterLink to="/" class="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline">
      Back home
    </RouterLink>
  </div>
</template>
