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
  const pages = Math.ceil(totalNews.value / pageSize.value)
  return pages <= 0 ? 1 : pages
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

const isPageSizeMenuOpen = ref(false)

const isStatusMenuOpen = ref(false)

function selectStatus(value: string) {
  statusFilter.value = value
  isStatusMenuOpen.value = false
  loadEvents()
}

const statusFilter = ref('')
const keyword = ref('')

function loadEvents() {
  let queryFunction
  if (statusFilter.value && statusFilter.value !== '') {
    queryFunction = NewsService.getNewsByStatus(statusFilter.value, pageSize.value, page.value)
  } else if (keyword.value === '') {
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
  return NewsService.adminRemoveNews(id)
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
    class="bg-gray-800 fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm text-gray-900 rounded-xl shadow-xl border border-gray-200 p-4 flex flex-col gap-3"
  >
    <div class="text-sm font-semibold text-white">Delete this news?</div>

    <div class="text-xs text-white break-words line-clamp-2">
      {{ pendingDeleteTitle }}
    </div>

    <div class="flex justify-end gap-2 text-xs font-medium">
      <button
        class="px-3 py-1.5 rounded-lg border border-gray-300 text-white hover:bg-gray-500"
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

  <router-link
    v-if="auth.isMember || auth.isAdmin"
    :to="{ name: 'add-news' }"
    aria-label="Add News"
    class="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full px-4 py-3 font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
  >
    <span class="text-xl leading-none">＋</span>
    <span class="hidden sm:inline">Add News</span>
  </router-link>

  <!-- Search bar -->
  <div class="w-full max-w-xs sm:w-64 justify-center mx-auto mb-6">
    <BaseInput v-model="keyword" label="Search..." @input="loadEvents" class="w-full" />
  </div>

  <div class="pt-8 pb-16 min-h-screen">
    <div class="container mx-auto px-4 sm:px-6 md:px-50">
      <!-- Filter Row -->
      <div
        class="mb-4 flex flex-col gap-4 sm:gap-2 sm:flex-row sm:flex-wrap sm:items-start justify-start"
      >
        <!-- Status Filter -->
        <div class="relative inline-block text-left w-full sm:w-auto">
          <button
            type="button"
            class="inline-flex w-full sm:min-w-[140px] sm:w-auto items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
            @click="isStatusMenuOpen = !isStatusMenuOpen"
          >
            <span>
              <span v-if="statusFilter === ''">ALL</span>
              <span v-else-if="statusFilter === 'FAKE'">FAKE</span>
              <span v-else-if="statusFilter === 'NOT_FAKE'">NOT FAKE</span>
              <span v-else-if="statusFilter === 'TIE'">TIE</span>
              <span v-else-if="statusFilter === 'UNVERIFIED'">UNVERIFIED</span>
              <span v-else>{{ statusFilter }}</span>
            </span>

            <svg
              class="h-4 w-4 text-gray-500 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <div
            v-if="isStatusMenuOpen"
            class="absolute z-40 mt-2 w-40 origin-top-left rounded-md border shadow-lg ring-1 ring-black/5 focus:outline-none"
          >
            <ul class="py-1 text-sm text-gray-700">
              <li>
                <button
                  class="font-bold flex w-full items-center justify-between px-3 py-2 text-black bg-white hover:bg-gray-100 text-left"
                  @click="selectStatus('')"
                >
                  <span>ALL</span>
                </button>
              </li>

              <li>
                <button
                  class="font-bold flex w-full items-center justify-between px-3 py-2 bg-red-600 hover:bg-red-500 text-left text-white"
                  @click="selectStatus('FAKE')"
                >
                  <span>FAKE</span>
                </button>
              </li>

              <li>
                <button
                  class="font-bold flex w-full items-center justify-between px-3 py-2 bg-green-600 hover:bg-green-500 text-left text-white"
                  @click="selectStatus('NOT_FAKE')"
                >
                  <span>NOT FAKE</span>
                </button>
              </li>

              <li>
                <button
                  class="font-bold flex w-full items-center justify-between px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-left text-black"
                  @click="selectStatus('TIE')"
                >
                  <span>TIE</span>
                </button>
              </li>

              <li>
                <button
                  class="font-bold flex w-full items-center justify-between px-3 py-2 bg-gray-400 hover:bg-gray-300 text-left text-black"
                  @click="selectStatus('UNVERIFIED')"
                >
                  <span>UNVERIFIED</span>
                  <span
                    v-if="statusFilter === 'UNVERIFIED'"
                    class="h-2 w-2 rounded-full bg-gray-400"
                  ></span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Page Size -->
        <div class="relative inline-block text-left ml-0 sm:ml-5 w-full sm:w-auto">
          <button
            type="button"
            class="inline-flex w-full sm:min-w-[160px] sm:w-auto items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            @click="isPageSizeMenuOpen = !isPageSizeMenuOpen"
          >
            <span>{{ pageSize }} per page</span>

            <svg
              class="h-4 w-4 text-gray-500 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <div
            v-if="isPageSizeMenuOpen"
            class="font-semibold absolute z-50 mt-2 w-44 origin-top-left rounded-md border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
          >
            <ul class="font-semibold py-1 text-sm text-gray-700 max-h-60 overflow-auto">
              <li v-for="size in pageSizeOption" :key="size">
                <router-link
                  :to="{ name: 'news-view', query: { page: 1, pageSize: size } }"
                  class="font-semibold flex w-full items-center justify-between px-3 py-2 hover:bg-gray-100 text-left"
                  @click="isPageSizeMenuOpen = false"
                >
                  <span>{{ size }} per page</span>
                </router-link>
              </li>
            </ul>
          </div>
        </div>

        <!-- Search -->
        <div class="inline-block ml-0 sm:ml-2 w-full sm:w-auto">
          <input
            v-model="keyword"
            type="text"
            placeholder="Search..."
            @input="loadEvents"
            class="border border-white bg-white text-black rounded px-3 py-2 text-sm w-full sm:w-64 focus:outline-none"
          />
        </div>
      </div>

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

      <!-- pagination -->
      <div class="mt-5 justify-center flex text-sm font-medium text-gray-200">
        Page {{ page }} of {{ totalPages }}
        <span v-if="totalNews"> </span>
      </div>

      <!-- row: page numbers -->
      <div class="flex flex-wrap justify-center space-x-2 mt-4 select-none">
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

      <!-- row: prev / next -->
      <div class="flex justify-center items-center mt-4 space-x-2 select-none">
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

        <router-link
          v-if="hasNext"
          :to="{ name: 'news-view', query: { page: page + 1, pageSize: pageSize } }"
          class="flex items-center"
        >
          <button
            class="min-w-[90px] h-9 flex items-center justify-center border rounded text-white hover:bg-gray-200 transition"
          >
            Next Page ›
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>
