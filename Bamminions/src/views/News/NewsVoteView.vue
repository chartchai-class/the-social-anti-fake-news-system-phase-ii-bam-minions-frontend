<script setup lang="ts">
import { defineProps } from 'vue'
import { type News } from '@/types'

const props = defineProps<{
  news: News
}>()
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Vote on this News</h2>
    <div class="flex gap-4">
      <button class="bg-green-500 text-white px-4 py-2 rounded">Not Fake</button>
      <button class="bg-red-500 text-white px-4 py-2 rounded">Fake</button>
    </div>
  </div>
</template>
