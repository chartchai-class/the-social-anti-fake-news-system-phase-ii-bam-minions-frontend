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
    pageSize: { type: Number, required: true } 
})

const page = computed(() => props.page)
const pageSize = computed(() => props.pageSize)
const pageSizeOption = [2, 3, 4, 6]
const users = ref<AdminUser[]>([])
const totalUsers = ref(0)

const hasNexPage = computed(() => {
  const totalPages = Math.ceil(totalUsers.value / pageSize.value)
  return page.value < totalPages
})

function loadUsers() {
  UserService.getUsers(pageSize.value, page.value)
    .then((res) => {
      users.value = res.data as AdminUser[]
      totalUsers.value = Number(res.headers['x-total-count'] || 0)
    })
    .catch(() => router.push({ name: 'NetworkError' }))
}

onMounted(loadUsers)
watch([page, pageSize], loadUsers)
watch(() => bus.version, loadUsers)
</script>

<template>
  <div class="flex justify-center gap-4 my-6">
    <router-link
      v-for="size in pageSizeOption"
      :key="size"
      :to="{ name: 'admin-dashboard', query: { page: 1, pageSize: size } }"
    >
      <button
        class="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 transition"
        :class="{ 'bg-green-100 text-green-700 font-semibold': Number(pageSize) === size }"
      >
        {{ size }} per page
      </button>
    </router-link>
  </div>

  <h1 class="text-3xl">Users</h1>

  <div class="flex flex-col items-center">
    <UserCard
      v-for="u in users"
      :key="u.id"
      :user="u"
    />

    <div class="flex w-[290px] justify-between text-blue-700 font-medium">
      <router-link
        class="text-left hover:underline"
        :to="{ name: 'admin-dashboard', query: { page: page - 1, pageSize: pageSize } }"
        rel="prev"
        v-if="page != 1"
      >
        &#60; Prev Page
      </router-link>
      <router-link
        class="text-right hover:underline"
        :to="{ name: 'admin-dashboard', query: { page: page + 1, pageSize: pageSize } }"
        rel="next"
        v-if="hasNexPage"
      >
        Next Page &#62;
      </router-link>
    </div>
  </div>
</template>