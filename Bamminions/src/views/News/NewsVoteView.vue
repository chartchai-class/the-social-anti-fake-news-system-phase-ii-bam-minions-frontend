<script setup lang="ts">
import ImageUpload from '@/components/ImageUpload.vue'
import * as yup from 'yup'
import VoteService from '@/services/VoteService'
import { useField, useForm } from 'vee-validate'
import type { News, VoteLabel, VoteRequest } from '@/types'
import { useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/new'

const props = defineProps<{
  news: News
}>()

const validationSchema = yup.object({
  label: yup.mixed<VoteLabel>().oneOf(['FAKE', 'NOT_FAKE'], 'The Vote is required'),
  content: yup.string().required('The conment is required'),
  image: yup.array(yup.string()),
})

const router = useRouter()
const { errors, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    label: '' as '' | VoteLabel,
    content: '',
    image: [],
  },
})
function choose(value: VoteLabel) {
  label.value = value
}
const { value: label } = useField<VoteLabel>('label')
const { value: comment } = useField<string>('content')
const { value: image } = useField<string[]>('image')

const newsStore = useNewsStore()
const submit = handleSubmit((value) => {
  const payload: VoteRequest = {
    label: value.label as VoteLabel,
    content: value.content || '',
    image: value.image || [],
  }

  VoteService.savevoteandComment(props.news.id, payload)
    .then(() => {
      console.log('Vote submitted successfully')

      return newsStore.fetchNews(props.news.id)
    })
    .then(() => {
      router.push({ name: 'news-detail-view', params: { id: props.news.id } })
    })
    .catch((err) => {
      console.log('Error submitting vote:', err)
    })
})
</script>

<template>
  <div class="p-6 border rounded-xl bg-white/60">
    <h2 class="text-xl font-semibold mb-3">Vote on this News</h2>

    <div class="flex gap-3 mb-2">
      <button
        class="px-4 py-2 rounded border"
        :class="label === 'NOT_FAKE' ? 'bg-green-600 text-white' : 'bg-white'"
        @click="() => choose('NOT_FAKE')"
        type="button"
      >
        Not Fake
      </button>

      <button
        class="px-4 py-2 rounded border"
        :class="label === 'FAKE' ? 'bg-red-600 text-white' : 'bg-white'"
        @click="() => choose('FAKE')"
        type="button"
      >
        Fake
      </button>
    </div>
    <p v-if="errors.label" class="text-red-600 text-sm mb-3">{{ errors.label }}</p>

    <label class="block text-sm font-medium mb-1">Comment (optional)</label>
    <textarea
      v-model="comment"
      rows="3"
      class="w-full mb-2 rounded border p-2"
      placeholder="Comment here.."
    ></textarea>
    <p v-if="errors.comment" class="text-red-600 text-sm mb-3">{{ errors.comment }}</p>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-1">Images (optional)</label>
      <ImageUpload v-model="image" />
      <p v-if="errors.image" class="text-red-600 text-sm mt-1">{{ errors.image }}</p>
    </div>

    <button
      class="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
      :disabled="!label"
      @click="submit"
      type="button"
    >
      Submit Vote
    </button>
  </div>
</template>
