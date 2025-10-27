<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()

const token = localStorage.getItem('access_token')
const user = localStorage.getItem('user')
if (token && user) {
  authStore.reload(token, JSON.parse(user))
} else {
  authStore.logout()
}
</script>
<template>
  <div id="app" class="min-h-screen pt-16 relative min-h-screen bg-gradient-to-b bg-gray-700">
    <Navbar />
    <Router-view />
  </div>
</template>

<style scoped></style>
