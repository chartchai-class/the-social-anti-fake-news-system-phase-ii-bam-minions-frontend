<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import ImageUpload from '@/components/ImageUpload.vue'
import NewsService from '@/services/NewsService'
import type { News as NewsType } from '@/types'

// Only the fields users should input
const news = ref<{
  topic: string
  shortDetail: string
  detail: string
  image: string[]
}>({
  topic: '',
  shortDetail: '',
  detail: '',
  image: [],
})

const router = useRouter()
const store = useMessageStore()

function saveNews() {
  // Send only user-entered fields; backend will fill id/created_at/reporter/status/counts/comments
  NewsService.saveNews({
    topic: news.value.topic,
    shortDetail: news.value.shortDetail,
    detail: news.value.detail,
    image: news.value.image,
  } as unknown as NewsType)
    .then((response) => {
      router.push({ name: 'news-detail-view', params: { id: response.data.id } })
      store.updateMessage('You successfully created news: ' + response.data.topic)
      setTimeout(() => {
        store.resetMessage()
      }, 3000)
    })
    .catch(() => {
      router.push({ name: 'news-view' })
      store.updateMessage('Failed to create news: ' + news.value.topic)
      setTimeout(() => {
        store.resetMessage()
      }, 3000)
    })
}
</script>

<template>
  <!-- Full screen center -->
  <div class="w-full flex items-center justify-center p-20 min-h-screen bg-gradient-to-b to-white">
    <!-- Transparent card -->
    <div class="w-full max-w-2xl rounded-2xl bg-white/10 backdrop-blur-md shadow-xl p-6">
      <h1 class="text-5xl font-bold mb-4 text-center text-white p-10">Create your News</h1>

      <form @submit.prevent="saveNews" class="space-y-4 text-white">
        <div class="space-y-1">
          <label for="topic" class="block font-medium">Topic</label>
          <input
            id="topic"
            v-model="news.topic"
            type="text"
            class="w-full rounded-lg border border-white/30 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
            placeholder="Headline"
            required
          />
        </div>

        <div class="space-y-1 text-white">
          <label for="shortDetail" class="block font-medium">Short detail</label>
          <input
            id="shortDetail"
            v-model="news.shortDetail"
            type="text"
            class="w-full rounded-lg border border-white/30 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40"
            placeholder="One-line summary"
            required
          />
        </div>

        <div class="space-y-1">
          <label for="detail" class="block font-medium">Detail</label>
          <textarea
            id="detail"
            v-model="news.detail"
            class="w-full h-28 rounded-lg border border-white/30 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-white/40 h-48 overflow-y-auto resize-y [scrollbar-width:none] [-ms-overflow-style:'none'] [&::-webkit-scrollbar]:hidden"
            placeholder="Write the full news content"
            required
          ></textarea>
        </div>

        <div class="space-y-2">
          <label class="block font-medium">Images</label>
          <ImageUpload v-model="news.image" />
        </div>

        <div class="flex flex-col sm:flex-row justify-center gap-3 mt-6">
          <!-- Submit -->
          <button
            class="w-full sm:w-auto min-w-[200px] px-6 md:px-8 py-3 md:py-3.5 rounded-2xl text-base md:text-lg font-semibold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-indigo-600 transition"
            type="submit"
          >
            Submit
          </button>

          <router-link
            :to="{ name: 'news-view' }"
            class="w-full sm:w-auto min-w-[200px] px-6 md:px-8 py-3 md:py-3.5 rounded-2xl text-base md:text-lg font-semibold bg-red-600 text-white text-center shadow-lg hover:bg-red-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 active:scale-[0.99] transition"
          >
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>
