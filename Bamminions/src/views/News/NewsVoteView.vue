<script setup lang="ts">
import ImageUpload from '@/components/ImageUpload.vue'
import * as yup from 'yup'
import VoteService from '@/services/VoteService'
import { useField, useForm } from 'vee-validate'
import type { News, VoteLabel, VoteRequest } from '@/types'
import { useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/new'
import { onMounted } from 'vue'

const props = defineProps<{ news: News }>()

const validationSchema = yup.object({
  label: yup.mixed<VoteLabel>().oneOf(['FAKE', 'NOT_FAKE'], 'Vote is required'),
  // optional, but validate length a bit
  content: yup.string().max(500, 'Max 500 characters'),
  image: yup.array(yup.string()),
})

const router = useRouter()
const { errors, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    label: 'NOT_FAKE' as VoteLabel,
    content: '',
    image: [] as string[],
  },
})

const { value: label } = useField<VoteLabel>('label')
const { value: comment } = useField<string>('content')
const { value: image } = useField<string[]>('image')

function choose(value: VoteLabel) {
  label.value = value
}

const newsStore = useNewsStore()
const submit = handleSubmit((value) => {
  const payload: VoteRequest = {
    label: value.label as VoteLabel,
    content: value.content || '',
    image: value.image || [],
  }

  VoteService.savevoteandComment(props.news.id, payload)
    .then(() => newsStore.fetchNews(props.news.id))
    .then(() => {
      router.push({ name: 'news-detail-view', params: { id: props.news.id } })
    })
    .catch((err) => {
      console.log('Error submitting vote:', err)
    })
})

onMounted(() => {
  if (!label.value) label.value = 'NOT_FAKE'
})
</script>

<template>
  <div
    class="mt-13 p-4 sm:p-6 rounded-2xl backdrop-blur border border-white/80 bg-black/20 space-y-4 max-w-xl w-full mx-auto overflow-hidden"
  >
    <h2 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white text-center">
      Vote on this News
    </h2>

    <div>
      <img
        v-if="news.image && news.image.length > 0"
        :src="news.image[0]"
        alt="News Image"
        class="w-full h-auto rounded-lg"
      />
    </div>

    <div
      class="flex w-full rounded-xl ring-1 ring-gray-200 dark:ring-white/10 bg-white/60 dark:bg-white/5 overflow-hidden"
      role="tablist"
      aria-label="Vote"
    >
      <button
        type="button"
        class="w-1/2 px-3 py-2 text-sm font-medium transition"
        :class="[
          label === 'NOT_FAKE'
            ? 'bg-emerald-600 text-white'
            : 'text-gray-700 dark:text-gray-200 hover:bg-emerald-50 hover:text-emerald-700',
        ]"
        @click="choose('NOT_FAKE')"
      >
        Not Fake
      </button>

      <button
        type="button"
        class="w-1/2 px-3 py-2 text-sm font-medium transition"
        :class="[
          label === 'FAKE'
            ? 'bg-red-600 text-white'
            : 'text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-red-700',
        ]"
        @click="choose('FAKE')"
      >
        Fake
      </button>
    </div>
    <p v-if="errors.label" class="text-xs text-red-600 dark:text-red-400 -mt-1">
      {{ errors.label }}
    </p>

    <!-- Comment -->
    <div class="space-y-1">
      <label class="block text-sm font-medium text-gray-800 dark:text-gray-200">
        Comment <span class="text-gray-500 text-xs">(optional)</span>
      </label>
      <textarea
        v-model="comment"
        class="w-full h-28 resize-none overflow-y-auto no-scrollbar rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
        placeholder="Add a short note…"
      ></textarea>
      <p v-if="errors.content" class="text-xs text-red-600 dark:text-red-400">
        {{ errors.content }}
      </p>
    </div>

    <div class="space-y-1">
      <label class="block text-sm font-medium text-gray-800 dark:text-gray-200">
        Images <span class="text-gray-500 text-xs">(optional)</span>
      </label>
      <ImageUpload v-model="image" />
      <p v-if="errors.image" class="text-xs text-red-600 dark:text-red-400">
        {{ errors.image }}
      </p>
    </div>

    <!-- Buttons side-by-side on all screen sizes -->
    <div class="grid grid-cols-2 gap-3 mt-6 pb-1">
      <button
        type="button"
        class="w-full px-6 md:px-8 py-3 md:py-3.5 rounded-2xl text-base md:text-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition"
        :disabled="!label"
        @click="submit"
      >
        Submit Vote
      </button>

      <router-link
        :to="{ name: 'news-detail-view', params: { id: props.news.id } }"
        class="w-full px-6 md:px-8 py-3 md:py-3.5 rounded-2xl text-base md:text-lg font-semibold bg-red-600 text-white text-center hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 active:scale-[0.99] transition"
      >
        Cancel
      </router-link>
    </div>
  </div>
</template>
