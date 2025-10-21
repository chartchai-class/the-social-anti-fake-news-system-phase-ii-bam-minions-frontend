<script setup lang="ts">
import NewsCard from '@/components/NewsCard.vue';
import NewsService from '@/services/NewsService';
import type { News } from '@/types';
import { ref, onMounted, watchEffect } from 'vue';

const newsList = ref<News[]>([]);

const props = defineProps<{
    newsData: News[]
}>();

function updatedNewsList() {
    if (props.newsData && props.newsData.length > 0) {
        newsList.value = props.newsData;
    } else {
        NewsService.getNews()
            .then((response) => {
                newsList.value = response.data;
            })
            .catch((error) => {
                console.error('Error fetching news:', error);
            });
    }
}

onMounted(() => {
    watchEffect(() => {
        updatedNewsList();
    });
});
</script>
<template>
    <div class="container mx-auto p-4">
        <NewsCard v-for="newsItem in newsList" :key="newsItem.id" :news="newsItem" />
    </div>
</template>