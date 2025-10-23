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


const hasNextPage = computed(() => {
  const totalPages = Math.ceil(totalNews.value / pageSize.value)
  return page.value < totalPages
})

const totalPages = computed(() => {
  return Math.ceil(totalNews.value / pageSize.value)
})
const keyword = ref('')
function loadEvents() {
  let queryFunction;
  if (keyword.value === '') {
    queryFunction = NewsService.getNews(pageSize.value, page.value)
  } else {
    queryFunction =  NewsService.getNewsByKeyword(keyword.value, pageSize.value, page.value)
  }
  queryFunction.then((response) => {
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

    <div class = "w-64 justify-center mx-auto mb-6">
    <BaseInput
      v-model="keyword"
      label="Search..."
      @input="loadEvents"
      class="w-full"/>
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

  <div class="flex flex-col items-center space-y-6">
    <div class="flex justify-between w-72 text-sm text-white font-medium">
      <router-link
        v-if="page !== 1"
        :to="{ name: 'news-view', query: { page: page - 1, pageSize: pageSize } }"
        class="hover:text-gray-500 transition-colors"
      >
        &#60; Prev Page
      </router-link>
      <div class="text-gray-200 font-semibold">
      Page {{ page }} / {{ totalPages }}
      </div>
      <router-link
        v-if="hasNextPage"
        :to="{ name: 'news-view', query: { page: page + 1, pageSize: pageSize } }"
        class="hover:text-gray-500 transition-colors"
      >
        Next Page &#62;
      </router-link>
    </div>
  </div>
        </div>
    </div>
</template>
