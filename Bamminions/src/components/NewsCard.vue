<script setup lang="ts">
import { type News } from '@/types'

defineProps<{
    news: News;
    isFeatured?: boolean; 
}>()
</script>

<template>
    <router-link :to="{ name: 'news-detail', params: { id: String(news.id) } }" class="no-underline w-full">

        <div v-if="isFeatured" 
             class=" h-96 relative bg-cover bg-center text-white p-6 flex items-end rounded-xl shadow-2xl transition-shadow duration-300 hover:shadow-3xl">
            <div class="absolute inset-0 bg-black opacity-50 rounded-xl"></div>
            
            <div class="relative z-10 w-full">
                <h2 class="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                    {{ news.topic }}
                </h2>
                <h2 class="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                    {{ news.status }}
                </h2>
                <div class="flex items-center text-sm font-medium opacity-80">
                    <span class="mr-3">Author Name : </span> 
                    <span>Time: {{ news.created_at }}</span>
                </div>
            </div>
        </div>
        
        <div v-else class="flex p-1 m-auto w-full bg-gray-100 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 mb-5 ">
        <div class="p-6 "> 
        
        <h2 class="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {{ news.topic }}
        </h2>
        <h2 class="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {{ news.status }}
        </h2>
        <p class="text-sm text-gray-600 mb-3">
            {{ news.short_detail }}
        </p>
        
        <div class="flex items-center text-xs font-medium text-gray-600 mb-4">
            <span class="mr-3">Author Name : </span>
            <span class="text-emerald-600">Time: {{ news.created_at }}</span>
        </div>
        
        <div class="border-t border-gray-100 pt-4 mt-4 ">
            <p class="text-sm text-gray-700 whitespace-pre-line">
                {{ news.detail }}
            </p>
        </div>
        </div>
    </div>

    </router-link>
</template>