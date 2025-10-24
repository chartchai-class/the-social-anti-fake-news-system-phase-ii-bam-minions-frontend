<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
</script>
<template>
  <div id="app" class="min-h-screen pt-16 relative min-h-screen bg-gradient-to-b bg-gray-700">
    <Navbar />
    <Router-view />
  </div>
</template>

<style scoped></style>
