<script setup lang="ts">
import { type News } from '@/types'

defineProps<{
  news: News
}>()
</script>
<template>
  <router-link :to="{ name: 'news-detail', params: { id: String(news.id) } }" class="no-underline">
    <div class="max-w-xl mx-auto my-4 bg-gray-100 rounded-xl shadow-lg border border-gray-100">
      <div class="p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-2 leading-tight">
          {{ news.topic }}
        </h2>

        <p class="text-sm text-gray-600 mb-3">
          {{ news.short_detail }}
        </p>

        <p class="text-xs font-medium text-emerald-600 mb-4">Time: {{ news.created_at }}</p>

        <div class="border-t border-gray-100 pt-4 mt-4">
          <p class="text-sm text-gray-700 whitespace-pre-line">
            {{ news.detail }}
          </p>
        </div>
      </div>
    </div>
  </router-link>
</template>
