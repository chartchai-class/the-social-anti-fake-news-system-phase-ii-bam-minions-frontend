<script setup lang="ts">
import NewsCard from '@/components/NewsCard.vue'
import NewsService from '@/services/NewsService'
import type { News } from '@/types'
import { ref, onMounted, computed , watchEffect } from 'vue'

const newsList = ref<News[]>([])
const pageSizeOption = [2, 3, 4, 6]
const specials = ref<News | null>(null);
const otherNews = ref<News[]>([]);
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
      const allNews: News[] = response.data;
      specials.value = allNews.find((news: News) => news.id === 1) || null;
      otherNews.value = allNews.filter((news: News) => news.id !== 1);

      console.log('Loading normal news:', response.data)
      newsList.value = response.data
      totalNews.value = response.headers['x-total-count']
    })
    .catch((error) => {
      console.log('There was an error!', error)
    })
}

onMounted(() => {
  watchEffect(() => {
    loadEvents()
  })
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
            class="px-3 py-1 rounded border border-gray-300 hover:bg-gray-500 transition"
            :class="{ 'bg-black text-white font-semibold': pageSize === size }"
          >
            {{ size }} per page
          </button>
        </router-link>
    </div>

    <div class="pt-8 pb-16 min-h-screen bg-gradient-to-b from-gray-700">
        <div class="container mx-auto px-4 md:px-50">
            
            <div class="flex justify-center mb-10">
                <NewsCard 
                    v-if="specials" 
                    :news="specials" 
                    class="w-full max-w-6xl p-0 shadow-2xl overflow-hidden" 
                    is-featured 
                />
            </div>
            
            <div class="container mx-auto">
                <NewsCard v-for="newsItem in otherNews" :key="newsItem.id" :news="newsItem" />
            </div>

        </div>
    </div>
</template>
