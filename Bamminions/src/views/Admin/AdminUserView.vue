<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import UserService from '@/services/UserService'
import UserCard from '@/components/UserCard.vue'
import { useUsersBus } from '@/stores/users'
import type { AdminUser } from '@/types'

const router = useRouter()
const bus = useUsersBus()

const props = defineProps({
  page: { type: Number, required: true },
  pageSize: { type: Number, required: true },
})

const page = computed(() => props.page)
const pageSize = computed(() => props.pageSize)
const pageSizeOption = [5, 10, 20]

const users = ref<AdminUser[]>([])
const totalUsers = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(totalUsers.value / pageSize.value)))
const hasPrev = computed(() => page.value > 1)
const hasNext = computed(() => page.value < totalPages.value)

// For "Showing X–Y of Z"
const showingFrom = computed(() =>
  totalUsers.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1,
)
const showingTo = computed(() => Math.min(page.value * pageSize.value, totalUsers.value))

function loadUsers() {
  UserService.getUsers(pageSize.value, page.value)
    .then((res) => {
      users.value = res.data as AdminUser[]
      totalUsers.value = Number(res.headers['x-total-count'] || 0)
    })
    .catch(() => router.push({ name: 'news-view' }))
}

// Build compact page list with ellipses
const pageList = computed<(number | string)[]>(() => {
  const current = page.value
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
})

onMounted(loadUsers)
watch([page, pageSize], loadUsers)
watch(() => bus.version, loadUsers)
</script>

<template>
  <section class="max-w-3xl mx-auto p-4 backdrop-blur shadow-xl rounded-xl p-5">
    <!-- Page size control -->
    <div class="mb-3 flex">
      <span class="text-sm text-gray-900 px-8">Page size</span>
      <!-- push the whole group to the right -->
      <div class="ml-auto flex items-center gap-3">
        <div class="flex gap-1">
          <router-link
            v-for="size in pageSizeOption"
            :key="size"
            :to="{ name: 'admin-user', query: { page: 1, pageSize: size } }"
          >
            <button
              class="px-2.5 py-1 rounded-full border text-sm leading-none transition"
              :class="
                pageSize === size
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              "
            >
              {{ size }}
            </button>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Users -->
    <div class="flex flex-col items-center gap-3">
      <UserCard v-for="u in users" :key="u.id" :user="u" />
    </div>

    <div class="mb-2 text-xs text-gray-600 text-center p-3">
      Showing {{ showingFrom }}–{{ showingTo }} of {{ totalUsers }}
    </div>

    <!-- Pagination -->
    <nav class="mt-4 flex items-center justify-center gap-5" aria-label="Pagination">
      <!-- First -->
      <router-link :to="{ name: 'admin-user', query: { page: 1, pageSize } }" class="inline-flex">
        <button
          class="px-3 py-1 rounded border text-sm"
          :class="
            hasPrev
              ? 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none'
          "
          aria-label="First page"
        >
          «
        </button>
      </router-link>

      <!-- Prev -->
      <router-link
        :to="{ name: 'admin-user', query: { page: page - 1, pageSize } }"
        class="inline-flex"
      >
        <button
          class="px-3 py-1 rounded border text-sm"
          :class="
            hasPrev
              ? 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none'
          "
          aria-label="Previous page"
        >
          ‹
        </button>
      </router-link>

      <!-- Numbered pages with ellipses -->
      <template v-for="p in pageList" :key="'p-' + p">
        <span v-if="p === '…'" class="px-2 text-sm text-gray-500 select-none">…</span>
        <router-link v-else :to="{ name: 'admin-user', query: { page: p as number, pageSize } }">
          <button
            class="min-w-[36px] px-2 py-1 rounded border text-sm"
            :class="
              page === p
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
            "
            :aria-current="page === p ? 'page' : undefined"
          >
            {{ p }}
          </button>
        </router-link>
      </template>

      <!-- Next -->
      <router-link
        :to="{ name: 'admin-user', query: { page: page + 1, pageSize } }"
        class="inline-flex"
      >
        <button
          class="px-3 py-1 rounded border text-sm"
          :class="
            hasNext
              ? 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none'
          "
          aria-label="Next page"
        >
          ›
        </button>
      </router-link>

      <!-- Last -->
      <router-link
        :to="{ name: 'admin-user', query: { page: totalPages, pageSize } }"
        class="inline-flex"
      >
        <button
          class="px-3 py-1 rounded border text-sm"
          :class="
            hasNext
              ? 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed pointer-events-none'
          "
          aria-label="Last page"
        >
          »
        </button>
      </router-link>
    </nav>

    <!-- Page X of Y -->
    <div class="mt-2 text-center text-xs text-gray-600 p-2">
      Page {{ page }} of {{ totalPages }}
    </div>
  </section>
</template>
