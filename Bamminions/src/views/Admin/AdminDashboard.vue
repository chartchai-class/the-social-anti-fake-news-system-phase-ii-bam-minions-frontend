<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isAdmin = computed(() => auth.isAdmin)

if (!isAdmin.value) {
  router.replace({ name: 'news-view' })
}

const currentFilter = computed(() => (route.query.filter as string) || 'removed')
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3">
      <h1 class="text-xl font-bold">Admin</h1>
      <div class="ml-auto flex gap-2">
        <router-link
          :to="{ name: 'admin-news', query: { filter: currentFilter, page: 1, pageSize: 10 } }"
          class="px-3 py-1 rounded border hover:bg-gray-100"
        >
          News
        </router-link>
        <router-link
          :to="{ name: 'admin-user', query: { page: 1, pageSize: 10 } }"
          class="px-3 py-1 rounded border hover:bg-gray-100"
        >
          Users
        </router-link>
      </div>
    </header>

    <main class="max-w-5xl mx-auto p-4">
      <router-view />
    </main>
  </div>
</template>
