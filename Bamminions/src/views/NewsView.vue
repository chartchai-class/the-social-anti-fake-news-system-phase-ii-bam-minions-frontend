<script setup lang="ts">
import NewsCard from '@/components/NewsCard.vue'
import NewsService from '@/services/NewsService'
import type { News } from '@/types'
import { ref, onMounted, computed } from 'vue'

const newsList = ref<News[]>([])
const pageSizeOption = [2, 3, 4, 6]
const totalNews = ref(0)

const page = computed(() => props.page)
const pageSize = computed(() => props.pageSize)
const props = defineProps({
  page: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
})

function loadEvents() {
  NewsService.getNews(pageSize.value, page.value)
    .then((response) => {
      console.log('Loading normal news:', response.data)
      newsList.value = response.data
      totalNews.value = response.headers['x-total-count']
    })
    .catch((error) => {
      console.log('There was an error!', error)
    })
}

onMounted(() => {
  loadEvents()
})
</script>
<template>
  <div class="flex justify-center gap-4 my-6">
    <router-link
      v-for="size in pageSizeOption"
      :key="size"
      :to="{ name: 'news-view', query: { page: 1, pageSize: size } }"
    >
      <button
        class="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 transition"
        :class="{ 'bg-green-100 text-green-700 font-semibold': pageSize === size }"
      >
        {{ size }} per page
      </button>
    </router-link>
  </div>
  <div class="pt-8 pb-16 min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <NewsCard v-for="newsItem in newsList" :key="newsItem.id" :news="newsItem" />
  </div>
</template>
