<script setup lang="ts">
import { useNewsStore } from '@/stores/new'
import { storeToRefs } from 'pinia'

const store = useNewsStore()
const { news } = storeToRefs(store)
</script>

<template>
  <div v-if="news" class="p-12 mx-auto text-gray-800">
    <nav class="mb-8 flex justify-center gap-4">
      <router-link
        :to="{ name: 'news-detail-view', params: { id: $route.params.id } }"
        class="group relative w-50 h-25 rounded-2xl border border-gray-300 bg-white/70 backdrop-blur ring-1 ring-black/5 hover:shadow transition"
        exact-active-class="!border-gray-300 !ring-gray-200"
      >
        <span
          class="absolute top-1 left-1 h-10 w-14 rounded-full bg-white shadow transition-transform duration-300 group-[.router-link-exact-active]:translate-x-16"
        ></span>
        <span
          class="pointer-events-none absolute inset-0 grid place-items-center font-semibold text-xl md:text-2xl text-gray-800"
        >
          Detail
        </span>
      </router-link>
    </nav>

    <router-view :news="news"></router-view>
  </div>
</template>
