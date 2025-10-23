<script setup lang="ts">
import { type Comment } from '@/types'

defineProps<{
  comment: Comment
}>()
</script>

<template>
  



      <div class="relative z-10 w-full">
        <h2 class="text-3xl md:text-4xl font-bold mb-3 leading-tight">
          {{  comment.content }}
        </h2>
        <h2 class="text-3xl md:text-4xl font-bold mb-3 leading-tight">
          {{ comment.voteLabel }}
        </h2>
        <div class="flex items-center text-sm font-medium opacity-80">
          <span class="mr-3">Firstname: {{ comment.usercomment.firstname }} Lastname: {{ comment.usercomment.lastname }}</span>
          <span>Time: {{ comment.created_at }}</span>
        </div>
      </div>
 
   
</template>
