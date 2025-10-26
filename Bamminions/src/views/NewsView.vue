<script setup lang="ts">
import NewsCard from '@/components/NewsCard.vue'
import NewsService from '@/services/NewsService'
import type { News } from '@/types'
import { ref, onMounted, computed, watchEffect } from 'vue'

const newsList = ref<News[]>([])
const pageSizeOption = [2, 3, 4, 6]
const specials = ref<News | null>(null)
const otherNews = ref<News[]>([])
const totalNews = ref(0)

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

const page = computed(() => props.page)
const pageSize = computed(() => props.pageSize)

const totalPages = computed(() => {
  return Math.ceil(totalNews.value / pageSize.value)
})

const hasPrev = computed(() => page.value > 1)
const hasNext = computed(() => page.value < totalPages.value)

const pages = computed(() => {
  const delta = 2
  const start = Math.max(1, page.value - delta)
  const end = Math.min(totalPages.value, page.value + delta)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const keyword = ref('')
function loadEvents() {
  let queryFunction
  if (keyword.value === '') {
    queryFunction = NewsService.getNews(pageSize.value, page.value)
  } else {
    queryFunction = NewsService.getNewsByKeyword(keyword.value, pageSize.value, page.value)
  }
  queryFunction
    .then((response) => {
      const allNews: News[] = response.data
      specials.value = allNews.find((news: News) => news.id === 1) || null
      otherNews.value = allNews.filter((news: News) => news.id !== 1)

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

  <router-link
    :to="{ name: 'add-news' }"
    aria-label="Add News"
    class="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full px-4 py-3 font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
  >
    <span class="text-xl leading-none">＋</span>
    <span class="hidden sm:inline">Add News</span>
  </router-link>

  <div class="w-64 justify-center mx-auto mb-6">
    <BaseInput v-model="keyword" label="Search..." @input="loadEvents" class="w-full" />
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

      <div class="mt-5 justify-center flex text-sm font-medium text-gray-200">
        Page {{ page }} of {{ totalPages }}
        <span v-if="totalNews"> </span>
      </div>

      <div class="flex justify-center items-center mt-8 space-x-2 select-none">
        <router-link
          v-if="hasPrev"
          :to="{ name: 'news-view', query: { page: page - 1, pageSize: pageSize } }"
          class="flex items-center"
        >
          <button
            class="min-w-[90px] h-9 flex items-center justify-center rounded border text-white hover:bg-gray-200 transition"
          >
            ‹ Prev Page
          </button>
        </router-link>

        <div class="flex space-x-2 mx-2">
          <router-link
            v-for="num in pages"
            :key="num"
            :to="{ name: 'news-view', query: { page: num, pageSize: pageSize } }"
          >
            <button
              class="w-9 h-9 flex items-center justify-center border transition"
              :class="[
                num === page
                  ? ' text-black bg-white font-bold'
                  : ' text-gray-700 bg-gray-100 hover:bg-gray-400',
              ]"
            >
              {{ num }}
            </button>
          </router-link>
        </div>

        <router-link
          v-if="hasNext"
          :to="{ name: 'news-view', query: { page: page + 1, pageSize: pageSize } }"
          class="flex items-center"
        >
          <button
            class="min-w-[90px] h-9 flex items-center justify-center border rounded text-white hover:bg-black transition"
          >
            Next Page ›
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>
