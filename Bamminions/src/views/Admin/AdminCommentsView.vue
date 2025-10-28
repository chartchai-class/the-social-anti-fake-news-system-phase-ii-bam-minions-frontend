<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import NewsService from '@/services/NewsService'

const props = defineProps<{ newsId: number; page: number; pageSize: number }>()
const items = ref<any[]>([])
const total = ref(0)
const loading = ref(false)

const page = computed(() => props.page)
const pageSize = computed(() => props.pageSize)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

function load() {
  loading.value = true
  NewsService.adminListComments(props.newsId, pageSize.value, page.value)
    .then((res) => {
      items.value = res.data
      total.value = Number(res.headers['x-total-count'] || 0)
    })
    .finally(() => (loading.value = false))
}

function removeComment(id: number) {
  NewsService.adminRemoveComment(id).then(load).catch(load)
}

watch(() => [page.value, pageSize.value, props.newsId], load, { immediate: true })
onMounted(load)
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">Admin • Comments (news #{{ props.newsId }})</h1>

    <div v-if="loading">Loading…</div>

    <div v-else class="space-y-3">
      <div
        v-for="c in items"
        :key="c.id"
        class="p-3 rounded border bg-white/80 flex items-start justify-between gap-3"
      >
        <div class="flex-1">
          <div class="text-sm">
            <span class="font-semibold">{{ c.usercomment?.username || 'unknown' }}</span>
            <span class="text-gray-500"> • {{ c.created_at }}</span>
          </div>
          <div class="text-sm mt-1">{{ c.content }}</div>
          <div class="text-xs text-gray-500 mt-1">
            voteLabel={{ c.voteLabel || '—' }}
            <span v-if="c.removed" class="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700">REMOVED</span>
          </div>
        </div>

        <button class="px-3 py-1 rounded bg-red-600 text-white" @click="removeComment(c.id)">Soft delete</button>
      </div>
    </div>

    <div class="mt-4 flex items-center gap-2">
      <router-link
        v-if="page>1"
        :to="{ name:'admin-news-comments', params:{ newsId: props.newsId }, query:{ page: page-1, pageSize } }"
      >
        <button class="px-3 py-1 rounded border">‹ Prev</button>
      </router-link>

      <div class="text-sm">Page {{ page }} / {{ totalPages }}</div>

      <router-link
        v-if="page<totalPages"
        :to="{ name:'admin-news-comments', params:{ newsId: props.newsId }, query:{ page: page+1, pageSize } }"
      >
        <button class="px-3 py-1 rounded border">Next ›</button>
      </router-link>
    </div>
  </div>
</template>
