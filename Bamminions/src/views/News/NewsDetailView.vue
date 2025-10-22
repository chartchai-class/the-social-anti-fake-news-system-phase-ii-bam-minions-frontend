<script setup lang="ts">
import { defineProps, toRefs } from 'vue'
import { type News } from '@/types'

const props = defineProps<{
  news: News
  topic: string
}>()

const { news } = toRefs(props)
console.log(news.value)
// console.log(news.value.image)
</script>

<template>
  <p>{{ news.topic }} @ {{ news.short_detail }}</p>
  <p>{{ news.detail }}</p>
  <div class="flex flex-row flex-wrap justify-center">
    <!-- <img
      v-for="image in news.image"
      :key="image"
      :src="image"
      alt="events image"
      class="border-solid border-gray-200 border-2 rounded p-1 m-1 w-40 hover:shadow-lg"
    /> -->
  </div>
</template>
