<script setup lang="ts">
import { useNewsStore } from '@/stores/new'
import { storeToRefs } from 'pinia'

const store = useNewsStore()
const { news } = storeToRefs(store)
</script>

<template>
  <div v-if="news" class="p-6 max-w-3xl mx-auto text-gray-800">
    <h1 class="text-3xl font-bold mb-4">{{ news.topic }}</h1>
    <nav class="mb-6 flex gap-4 text-black-700 font-medium justify-center">
      <router-link
        :to="{ name: 'news-detail-view' }"
        class="hover:underline"
        exact-active-class="text-green-500"
      >
        Details
      </router-link>

      <span>|</span>
    </nav>
    <router-view :news="news"></router-view>
  </div>
</template>
