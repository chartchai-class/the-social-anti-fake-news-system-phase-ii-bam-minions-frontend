<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import CommentService from '@/services/CommentService'
import type { Comment , News } from '@/types'
import CommentCard from '@/components/CommentCrad.vue'


const props = defineProps<{
  news: News
  page: number
  pageSize: number
}>()


const comments = ref<Comment[]>([])

const total = ref(0)

const page = computed(() => props.page)
const pageSize = computed(() => props.pageSize)
const hasNextPage = computed(() => {
  const totalPages = Math.ceil(total.value / pageSize.value)
  return page.value < totalPages
})

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
  watchEffect(() => {
    loadComments()
  })
})

</script>

<template>
  
  <div class="bg-gradient-to-b to-white flex items-center justify-center px-4 py-8">
    <div
      class="w-full max-w-6xl xl:max-w-7xl rounded-2xl bg-white/90 backdrop-blur shadow-xl ring-1 ring-black/5 overflow-hidden"
    >
      <!-- Header -->
      <div class="p-6 md:p-8 space-y-4">
        <!-- Chips -->
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs ring-1 ring-gray-200"
          >
            {{ news.created_at }}
          </span>
          <span
            class="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs ring-1 ring-gray-200"
          >
            {{ news.reporter.firstname }}
          </span>
          <span
            class="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs ring-1 ring-gray-200"
          >
            {{ news.comments?.length ?? 0 }} comments
          </span>



        </div>

        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          {{ news.topic }}
        </h1>
        <p class="text-gray-600 leading-relaxed">
          {{ news.short_detail }}
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <div
            class="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700"
          >
            Reliable <span class="font-semibold">{{ news.notFakeCount }}</span>
          </div>
          <div
            class="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700"
          >
            Fake <span class="font-semibold">{{ news.fakeCount }}</span>
          </div>
        </div>
      </div>

      <!-- Image -->
      <div class="px-6 md:px-8 mb-6">
        <img
          class="w-full h-72 md:h-[28rem] object-cover rounded-xl ring-1 ring-gray-200"
          src="https://media.formula1.com/image/upload/content/dam/fom-website/manual/Misc/2021-Master-Folder/F1%202021%20LAUNCH%20RENDERING%20(2).jpg"
          alt=""
        />
      </div>

      <!-- Body -->
      <div class="px-6 md:px-8 pb-8">
        <p class="text-gray-800 leading-relaxed">
          {{ news.detail }}
        </p>
      </div>
    </div>
     <div class="px-6 md:px-8 pb-8 space-y-4">
    <CommentCard
      v-for="c in comments"
      :key="c.id"
      :comment="c"
    />
  </div>
  </div>
</template>
