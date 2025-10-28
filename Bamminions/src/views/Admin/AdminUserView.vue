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

const hasNextPage = computed(() => {
  const totalPages = Math.ceil(totalUsers.value / pageSize.value)
  return page.value < totalPages
})

function loadUsers() {
  UserService.getUsers(pageSize.value, page.value)
    .then((res) => {
      users.value = res.data as AdminUser[]
      totalUsers.value = Number(res.headers['x-total-count'] || 0)
    })
    .catch(() => router.push({ name: 'news-view' }))
}

onMounted(loadUsers)
watch([page, pageSize], loadUsers)
watch(() => bus.version, loadUsers)
</script>

<template>
  <div class="flex justify-center gap-2 my-4">
    <router-link
      v-for="size in pageSizeOption"
      :key="size"
      :to="{ name: 'admin-user', query: { page: 1, pageSize: size } }"
    >
      <button
        class="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 transition"
        :class="{ 'bg-green-100 text-green-700 font-semibold': Number(pageSize) === size }"
      >
        {{ size }} / page
      </button>
    </router-link>
  </div>

  <h2 class="text-xl font-bold mb-3">Users</h2>

  <div class="flex flex-col items-center gap-2">
    <UserCard v-for="u in users" :key="u.id" :user="u" />

    <div class="flex w-[290px] justify-between text-blue-700 font-medium mt-2">
      <router-link
        class="text-left hover:underline"
        :to="{ name: 'admin-user', query: { page: page - 1, pageSize: pageSize } }"
        rel="prev"
        v-if="page > 1"
      >
        ‹ Prev Page
      </router-link>
      <router-link
        class="text-right hover:underline"
        :to="{ name: 'admin-user', query: { page: page + 1, pageSize: pageSize } }"
        rel="next"
        v-if="hasNextPage"
      >
        Next Page ›
      </router-link>
    </div>
  </div>
</template>
