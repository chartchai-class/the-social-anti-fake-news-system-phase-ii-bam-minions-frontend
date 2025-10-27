<script setup lang="ts">
import { type Comment } from '@/types'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()

const props = defineProps<{
  comment: Comment
  isDeleting?: boolean
  hasError?: boolean
  onRequestDelete: (id: number, contentPreview: string) => void
}>()


function handleDeleteComment() {
  if (props.isDeleting) return
  const preview = props.comment.content.slice(0, 20) || 'this comment'
  props.onRequestDelete(props.comment.id, preview)
}

</script>

<template>
  <div
    class="relative w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 pt-12 space-y-3"
  >
    <!-- meta (top-left) -->
    <div class="absolute top-2 left-3 text-[11px] text-gray-600">
      <div class="font-medium text-gray-700">
        by {{ comment.usercomment.firstname }} {{ comment.usercomment.lastname }}
      </div>
      <div class="text-[10px] text-gray-500">
        {{ comment.created_at }}
      </div>
    </div>

    <!-- status badge (top-right, no icon) -->
    <span
      class="absolute top-2 right-3 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 uppercase tracking-wide"
      :class="
        comment.voteLabel === 'NOT_FAKE'
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-red-50 text-red-700 ring-red-200'
      "
    >
      {{ comment.voteLabel === 'NOT_FAKE' ? 'NOT FAKE' : 'FAKE' }}
    </span>

     <button
      v-if="auth.isAdmin === true"
      class="text-[10px] font-semibold text-red-200 bg-red-600 rounded px-2 py-[2px] hover:bg-red-50 hover:text-red-700 absolute bottom-2 right-3
             disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="isDeleting"
      @click.stop.prevent="handleDeleteComment"
    >
      <span v-if="isDeleting">Deleting…</span>
      <span v-else>Delete</span>
    </button>

    <!-- content -->
    <p class="text-sm text-gray-900 leading-6 break-words">
      {{ comment.content }}
    </p>

    <!-- images (optional) -->
    <div v-if="comment.image?.length" class="grid grid-cols-3 gap-2">
      <img
        v-for="image in comment.image"
        :key="image"
        :src="image"
        alt="comment image"
        class="aspect-square w-full object-cover rounded-md ring-1 ring-gray-200"
      />
    </div>
  </div>
</template>
