<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import NewsService from '@/services/NewsService'
import { useRouter } from 'vue-router'

const props = defineProps<{ page: number; pageSize: number; filter: string }>()
const router = useRouter()

const items = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const err = ref<string | null>(null)

const page = computed(() => props.page)
const pageSize = computed(() => props.pageSize)
const filter = computed(() => (props.filter || 'removed').toLowerCase())

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

function load() {
  loading.value = true
  err.value = null
  NewsService.adminListNews(filter.value, pageSize.value, page.value)
    .then((res) => {
      items.value = res.data
      total.value = Number(res.headers['x-total-count'] || 0)
    })
    .catch((e) => (err.value = e?.message ?? 'load error'))
    .finally(() => (loading.value = false))
}

function goFilter(nextFilter: string) {
  router.push({ name: 'admin-news', query: { filter: nextFilter, page: 1, pageSize: pageSize.value } })
}



function openComments(newsId: number) {
  router.push({ name: 'admin-news-comments', params: { newsId }, query: { page: 1, pageSize: 10 } })
}

watch(() => [page.value, pageSize.value, filter.value], load, { immediate: true })
onMounted(load)
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">Admin • News</h1>

    <div class="flex gap-2 mb-4">
      <button class="px-3 py-1 rounded border" :class="filter==='removed' && 'bg-black text-white'"
              @click="goFilter('removed')">Removed</button>
      <button class="px-3 py-1 rounded border" :class="filter==='active' && 'bg-black text-white'"
              @click="goFilter('active')">Active</button>
      <button class="px-3 py-1 rounded border" :class="filter==='all' && 'bg-black text-white'"
              @click="goFilter('all')">All</button>
    </div>

    <div v-if="loading">Loading…</div>
    <div v-else-if="err" class="text-red-600">{{ err }}</div>

    <div v-else class="space-y-3">
      <div v-for="n in items" :key="n.id" class="p-3 rounded border bg-white/80 flex items-center gap-3">
        <img v-if="n.image?.length" :src="n.image[0]" class="w-20 h-14 object-cover rounded" />
        <div class="flex-1">
          <div class="font-semibold">
            {{ n.topic }}
            <span v-if="n.removed" class="ml-2 text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">REMOVED</span>
          </div>
          <div class="text-xs text-gray-500">
            {{ n.created_at }} • fake={{ n.fakeCount }} • notFake={{ n.notFakeCount }} • status={{ n.status }}
          </div>
        </div>

        <button class="px-3 py-1 rounded border" @click="openComments(n.id)">Comments</button>
      </div>
    </div>

    <div class="mt-4 flex items-center gap-2">
      <router-link v-if="page>1"
                   :to="{ name:'admin-news', query:{ filter: filter, page: page-1, pageSize } }">
        <button class="px-3 py-1 rounded border">‹ Prev</button>
      </router-link>
      <div class="text-sm">Page {{ page }} / {{ totalPages }}</div>
      <router-link v-if="page<totalPages"
                   :to="{ name:'admin-news', query:{ filter: filter, page: page+1, pageSize } }">
        <button class="px-3 py-1 rounded border">Next ›</button>
      </router-link>
    </div>
  </div>
</template>
