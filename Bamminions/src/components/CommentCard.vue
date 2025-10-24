<script setup lang="ts">
import { type Comment } from '@/types'

defineProps<{
  comment: Comment
}>()
</script>

<template>
  <div
    class="w-full max-w-6xl xl:max-w-7xl rounded-2xl backdrop-blur shadow-xl ring-1 ring-black/5 overflow-hidden p-6"
  >
    <h4
      class="font-bold uppercase tracking-wide text-white/90 bg-white/15 ring-1 ring-white/25 rounded-full px-2 py-[2px] text-center backdrop-blur-sm truncate mb-4"
    >
      {{ comment.voteLabel }}
    </h4>
    <h3 class="font-semibold leading-5 tracking-tight text-white/90 line-clamp-2 mb-2">
      {{ comment.content }}
    </h3>
    <div class="flex-1"></div>
    <div class="mt-1 flex items-center justify-between">
      <h6 class="text-[10px] leading-4 text-white/80 font-medium truncate">
        by {{ comment.usercomment.firstname }} {{ comment.usercomment.lastname }}
      </h6>
      <h6 class="text-[10px] leading-4 text-white/70 truncate">
        {{ comment.created_at }}
      </h6>
    </div>
  </div>
</template>
