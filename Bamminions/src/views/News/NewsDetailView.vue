<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import CommentService from '@/services/CommentService'
import type { Comment, News } from '@/types'
import CommentCard from '@/components/CommentCard.vue'

const props = defineProps<{
  news: News
  page: number
  pageSize: number
}>()

const comments = ref<Comment[]>([])

const total = ref(0)

const page = computed(() => props.page)
const pageSize = computed(() => props.pageSize)

function loadComments() {
  CommentService.getByNews(props.news.id, pageSize.value, page.value)
    .then((res) => {
      comments.value = res.data
      total.value = Number(res.headers['x-total-count'] || 0)
    })
    .catch((err) => {
      console.error('loadComments error:', err)
    })
}

onMounted(() => {
  loadComments()
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

    <div class="ml-8">
      <h2 class="text-base md:text-lg font-bold tracking-tight text-white text-center py-2">
        Comments
      </h2>
      <div class="space-y-2">
        <CommentCard v-for="c in comments" :key="c.id" :comment="c" />
      </div>
    </div>
  </div>
</template>
