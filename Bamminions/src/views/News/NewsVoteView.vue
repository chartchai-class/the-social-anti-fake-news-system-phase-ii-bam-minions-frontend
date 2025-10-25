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
const submit = handleSubmit(async (value) => {
  const payload: VoteRequest = {
    label: value.label as VoteLabel,
    content: value.content || '',
    image: value.image || [],
  }
  try {
    await VoteService.savevoteandComment(props.news.id, payload)
    await newsStore.fetchNews(props.news.id)
    router.push({ name: 'news-detail-view', params: { id: props.news.id } })
  } catch (err) {
    console.log('Error submitting vote:', err)
  }
})

onMounted(() => {
  if (!label.value) label.value = 'NOT_FAKE'
})
</script>

<template>
  <div
    class="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur ring-1 ring-black/5 dark:ring-white/10 shadow-md space-y-4 max-w-xl center mx-auto"
  >
    <h2 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white text-center">
      Vote on this News
    </h2>

    <div>
      <img
        v-if="news.image && news.image.length > 0"
        :src="news.image[0]"
        alt="News Image"
        class="w-full h-auto rounded-lg shadow"
      />
    </div>

    <div
      class="flex w-full rounded-xl ring-1 ring-gray-200 dark:ring-white/10 bg-white/60 dark:bg-white/5 overflow-hidden"
      role="tablist"
      aria-label="Vote"
    >
      <button
        type="button"
        class="w-1/2 px-3 py-2 text-sm font-medium transition rounded-md"
        :class="[
          label === 'NOT_FAKE'
            ? // selected: solid green + glow on hover
              'bg-emerald-600 text-white'
            : // unselected: light hover tint + green glow
              'text-gray-700 dark:text-gray-200 hover:bg-emerald-50 hover:text-emerald-700',
        ]"
        @click="choose('NOT_FAKE')"
      >
        Not Fake
      </button>

      <button
        type="button"
        class="w-1/2 px-3 py-2 text-sm font-medium transition rounded-md"
        :class="[
          label === 'FAKE'
            ? // selected: solid red + glow on hover
              'bg-red-600 text-white '
            : // unselected: light hover tint + red glow
              'text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-red-700 ',
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
    <div class="flex justify-center">
      <button
        type="button"
        class="w-full sm:w-auto min-w-[200px] px-6 md:px-8 py-3 md:py-3.5 rounded-2xl text-base md:text-lg font-semibold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-indigo-600 transition"
        :disabled="!label"
        @click="submit"
      >
        Submit Vote
      </button>
    </div>
  </div>
</template>
