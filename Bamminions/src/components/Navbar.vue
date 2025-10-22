<script setup lang="ts">
import { ref } from 'vue';
const open = ref(false);

</script>
<template>
    <nav
        class="fixed inset-x-0 top-0 z-50 h-16 py-2 px-8 flex items-center justify-between bg-gray-800 text-white"
    >
        <router-link :to="{ name: 'news-view'}" class="flex items-center text-2xl font-bold">
            <img src="@/assets/BamMinionsLogo.png" alt="Bamminions" class="h-15 w-auto">
            <span class="px-3 ml-2 text-xl font-bold">Bam Minions</span>
        </router-link>

        <div class="space-x-6 hidden md:block">
            <router-link
                :to="{ name: 'news-view'}"
                class="px-3 py-1 hover:bg-gray-700 rounded transition-colors duration-200"
            >
                Home
            </router-link>
            <router-link
                :to="{ name: 'news-view'}"
                class="px-3 py-1 hover:bg-gray-700 rounded transition-colors duration-200"
            >
                Contact
            </router-link>
        </div>
        
    </nav>
</template>