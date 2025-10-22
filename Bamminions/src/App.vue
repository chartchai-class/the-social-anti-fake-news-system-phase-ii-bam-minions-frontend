<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';</script>
<template>
  <div id="app" class="min-h-scree pt-16 relative min-h-screen bg-gradient-to-b">
    <Navbar />
    <router-view />
  </div>
</template>

<style scoped></style>
