<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import CommentService from '@/services/CommentService'
import type { Comment, News } from '@/types'
import CommentCard from '@/components/CommentCard.vue'

const props = defineProps<{
  news: News
  page: number
  pageSize: number
}>()

const comments = ref<Comment[]>([])

const totalComments = ref(0)

const page = computed(() => props.page)
const pageSize = computed(() => props.pageSize)

const hasPrev = computed(() => page.value > 1)
const hasNext = computed(() => page.value < totalPages.value)

const currentPage = ref<number>(props.page || 1)
const currentPageSize = ref<number>(props.pageSize || 5)

const totalPages = computed(() => {
  const size = currentPageSize.value > 0 ? currentPageSize.value : 1
  const pages = Math.ceil(totalComments.value / size)
  return pages === 0 ? 1 : pages
})

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

function loadComments() {
  CommentService.getByNews(props.news.id, pageSize.value, page.value)
    .then((res) => {
      comments.value = res.data
      totalComments.value = Number(res.headers['x-total-count'] || 0)
    })
    .catch((err) => {
      console.error('loadComments error:', err)
    })
}

watch(
  () => [props.page, props.pageSize],
  ([newPage, newPageSize]) => {
    const normalizedPage = newPage && newPage > 0 ? newPage : 1
    const normalizedSize = newPageSize && newPageSize > 0 ? newPageSize : 5

    const sizeChanged = normalizedSize !== currentPageSize.value
    const pageChanged = normalizedPage !== currentPage.value

    if (!sizeChanged && !pageChanged) {
      return
    }

    if (sizeChanged) {
      // ถ้า pageSize เปลี่ยน -> กลับไปหน้าแรก
      currentPageSize.value = normalizedSize
      currentPage.value = 1
    } else if (pageChanged) {
      currentPage.value = normalizedPage
    }
    loadComments()
  },
)

onMounted(() => {
  loadComments()
})
</script>

<template>
  <div class="flex justify-center px-4 py-8">
    <div
      class="w-full max-w-6xl xl:max-w-7xl rounded-2xl backdrop-blur shadow-xl ring-1 ring-black/5 overflow-hidden"
    >
      <div class="p-6 md:p-8 space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs ring-1 ring-gray-200"
          >
            Post by {{ news.reporter.firstname }} {{ news.reporter.lastname }}
          </span>
          <span
            class="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs ring-1 ring-gray-200"
          >
            Post on {{ news.created_at }}
          </span>

          <span
            class="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs ring-1 ring-gray-200"
          >
            Fake {{ news.fakeCount }} - Not Fake {{ news.notFakeCount }}
          </span>
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          {{ news.topic }}
        </h1>
      </div>

      <div class="px-6 md:px-8 mb-6">
        <img
          v-if="news.image && news.image.length > 0"
          :src="news.image[0]"
          alt="News Image"
          class="w-full h-auto rounded-lg shadow"
        />
      </div>
      <div class="px-6 md:px-8 mb-6">
        <h1 class="text-xl md:text-2xl font-semibold mb-4 text-gray-900">
          {{ news.short_detail }}
        </h1>
      </div>

      <div class="px-6 md:px-8 pb-8">
        <p class="text-gray-800 leading-relaxed">
          {{ news.detail }}
        </p>
      </div>
    </div>


      <div class="ml-8 w-full max-w-sm">
      <h2 class="text-base md:text-lg font-bold tracking-tight text-white text-center py-2">
        Comments
      </h2>

      <div class="space-y-3">
        <CommentCard
          v-for="c in comments"
          :key="c.id"
          :comment="c"
        />
      </div>

      <div class="mt-6">
        <div class="flex justify-center text-sm font-medium text-gray-200">
          Page {{ currentPage }} of {{ totalPages }}
          <span v-if="totalComments">&nbsp;•&nbsp;{{ totalComments }} comments total</span>
        </div>


        <div class="flex justify-center items-center mt-8 space-x-2 select-none text-xs">
  <!-- Prev -->
  <router-link
    v-if="hasPrev"
    :to="{
      name: 'news-detail-view',
      params: { id: news.id },
      query: { page: currentPage - 1, pageSize: currentPageSize }
    }"
    class="flex items-center"
  >
    <button
      class="min-w-[90px] h-9 flex items-center justify-center rounded border text-white hover:bg-gray-200 hover:text-black transition"
    >
      ‹ Prev Page
    </button>
  </router-link>

  <!-- page numbers -->
  <div class="flex space-x-2 mx-2">
    <router-link
      v-for="num in pages"
      :key="num"
      :to="{
        name: 'news-detail-view',
        params: { id: news.id },
        query: { page: num, pageSize: currentPageSize }
      }"
    >
      <button
        class="w-9 h-9 flex items-center justify-center border transition"
        :class="[
          num === currentPage
            ? 'text-black bg-white font-bold'
            : 'text-gray-200 bg-gray-700 hover:bg-gray-500'
        ]"
      >
        {{ num }}
      </button>
    </router-link>
  </div>

  <!-- Next -->
  <router-link
    v-if="hasNext"
    :to="{
      name: 'news-detail-view',
      params: { id: news.id },
      query: { page: currentPage + 1, pageSize: currentPageSize }
    }"
    class="flex items-center"
  >
    <button
      class="min-w-[90px] h-9 flex items-center justify-center border rounded text-white hover:bg-gray-200 hover:text-black transition"
    >
      Next Page ›
    </button>
  </router-link>
</div>
      </div>
    </div>
  </div>
</template>
