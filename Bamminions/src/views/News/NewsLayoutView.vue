<script setup lang="ts">
import { useNewsStore } from '@/stores/new'
import { storeToRefs } from 'pinia'

const store = useNewsStore()
const { news } = storeToRefs(store)
</script>

<template>
  <div v-if="news" class="p-12 text-gray-800 bg-gradient-to-b to-white">
    <nav class="mb-8 flex justify-center gap-4">
      <router-link
        :to="{ name: 'news-view' }"
        class="group relative w-50 h-25 rounded-2xl backdrop-blur shadow-xl ring-1 ring-black/5 overflow-hidden"
      >
        <span
          class="pointer-events-none absolute inset-0 grid place-items-center font-semibold text-2xl md:text-3xl text-white"
        >
          Home
        </span>
      </router-link>
      <router-link
        :to="{ name: 'news-detail-view', params: { id: $route.params.id } }"
        class="group relative w-50 h-25 rounded-2xl backdrop-blur shadow-xl ring-1 ring-black/5 overflow-hidden"
      >
        <span
          class="pointer-events-none absolute inset-0 grid place-items-center font-semibold text-2xl md:text-3xl text-white"
        >
          Detail
        </span>
      </router-link>

      <router-link
        :to="{ name: 'news-vote-view', params: { id: $route.params.id } }"
        class="group relative w-50 h-25 rounded-2xl backdrop-blur shadow-xl ring-1 ring-black/5 overflow-hidden"
      >
        <span
          class="pointer-events-none absolute inset-0 grid place-items-center font-semibold text-2xl md:text-3xl text-white"
        >
          Vote
        </span>
      </router-link>
    </nav>
    <router-view :news="news"></router-view>
  </div>
</template>
