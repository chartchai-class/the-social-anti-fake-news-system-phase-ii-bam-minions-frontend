<script setup lang="ts">
import NewsCard from '@/components/NewsCard.vue'
import NewsService from '@/services/NewsService'
import type { News } from '@/types'
import { ref, onMounted, computed, watchEffect } from 'vue'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()

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
  const start = 1
  const end = totalPages.value
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const deletingId = ref<number | null>(null)
const deleteErrorId = ref<number | null>(null)

const showConfirm = ref(false)
const pendingDeleteId = ref<number | null>(null)
const pendingDeleteTitle = ref('')

const noticeMessage = ref('')
const noticeType = ref<'success' | 'error'>('success')
const noticeVisible = ref(false)

function showNotice(msg: string, type: 'success' | 'error') {
  noticeMessage.value = msg
  noticeType.value = type
  noticeVisible.value = true

  setTimeout(() => {
    noticeVisible.value = false
  }, 2500)
}

function askDelete(id: number, title: string) {
  pendingDeleteId.value = id
  pendingDeleteTitle.value = title
  showConfirm.value = true
}

function cancelDelete() {
  showConfirm.value = false
  pendingDeleteId.value = null
  pendingDeleteTitle.value = ''
}

function confirmDelete() {
  if (pendingDeleteId.value === null) {
    cancelDelete()
    return
  }

  const idToDelete = pendingDeleteId.value

  showConfirm.value = false
  pendingDeleteId.value = null
  pendingDeleteTitle.value = ''

  return onDeleteNews(idToDelete)
}

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
      specials.value = allNews.length > 0 ? allNews[0] || null : null
      otherNews.value = allNews.slice(1)

      console.log('Loading normal news:', response.data)
      newsList.value = response.data
      totalNews.value = response.headers['x-total-count']
    })
    .catch((error) => {
      console.log('There was an error!', error)
    })
}

function onDeleteNews(id: number) {
  deleteErrorId.value = null
  deletingId.value = id

  const deletingFeatured = specials.value && specials.value.id === id

  if (deletingFeatured) {
    if (otherNews.value.length > 0) {
      const promoted = otherNews.value[0]
      specials.value = promoted || null
      otherNews.value = otherNews.value.slice(1)
    } else {
      specials.value = null
      otherNews.value = []
    }
  } else {
    otherNews.value = otherNews.value.filter((n) => n.id !== id)
  }
  return NewsService.deleteNews(id)
    .then(() => {
      showNotice('News deleted.', 'success')
      return loadEvents()
    })
    .catch(() => {
      showNotice('Failed to delete news.', 'error')
      return loadEvents()
    })
    .finally(() => {
      deletingId.value = null
    })
}

onMounted(() => {
  watchEffect(() => {
    loadEvents()
  })
})
</script>
<template>
  <div
    v-if="showConfirm"
    class="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 p-4 flex flex-col gap-3"
  >
    <div class="text-sm font-semibold text-gray-800">Delete this news?</div>

    <div class="text-xs text-gray-600 break-words line-clamp-2">
      {{ pendingDeleteTitle }}
    </div>

    <div class="flex justify-end gap-2 text-xs font-medium">
      <button
        class="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
        @click="cancelDelete"
      >
        Cancel
      </button>
      <button
        class="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
        @click="confirmDelete"
      >
        Delete
      </button>
    </div>
  </div>

  <div
    v-if="noticeVisible"
    class="fixed top-6 left-1/2 -translate-x-1/2 z-[3000] pointer-events-none"
  >
    <div
      class="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg text-center min-w-[200px]"
    >
      {{ noticeMessage }}
    </div>
  </div>

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

  <div>
    <input
      v-model="keyword"
      type="text"
      placeholder="Search..."
      @input="loadEvents"
      class="border rounded px-2 py-1 w-64 mx-auto block mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
    />
  </div>

  <router-link
  v-if="auth.isMember || auth.isAdmin"
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
          :on-delete-news="onDeleteNews"
          :is-deleting="deletingId === specials.id"
          :on-request-delete="askDelete"
        />
      </div>

      <div class="container mx-auto">
        <NewsCard
          v-for="newsItem in otherNews"
          :key="newsItem.id"
          :news="newsItem"
          :on-delete-news="onDeleteNews"
          :is-deleting="deletingId === newsItem.id"
          :on-request-delete="askDelete"
        />
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
