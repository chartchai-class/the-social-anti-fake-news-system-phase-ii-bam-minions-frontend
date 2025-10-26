<script setup lang="ts">
import { Form, Field, ErrorMessage, type SubmissionHandler } from 'vee-validate'
import * as yup from 'yup'
import ImageUpload from '@/components/ImageUpload.vue'
import apiClient from '@/services/AxiosCLient'
import { useRouter } from 'vue-router'

const router = useRouter()

// 1) Define the form value type
type NewsForm = {
  topic: string
  short_detail: string
  detail: string
  image: string[]
}

// 2) Initial values (lets <Form> infer generics instead of GenericObject)
const initialValues: NewsForm = {
  topic: '',
  short_detail: '',
  detail: '',
  image: [],
}

const schema = yup.object({
  topic: yup.string().required().min(5).max(120),
  short_detail: yup.string().required().max(200),
  detail: yup.string().required().min(20),
  image: yup.array().of(yup.string()).max(1, 'Only 1 image allowed'),
})

// 3) Type the submit handler the same way
const submit: SubmissionHandler<NewsForm> = (vals) => {
  return apiClient
    .post('/news', vals)
    .then(({ data }) => router.push({ name: 'news-detail-view', params: { id: data.id } }))
    .catch((e) => {
      console.error(e)
      alert('Failed to create news.')
    })
}
</script>

<template>
  <!-- 4) Pass :initial-values so the generic is NewsForm (not GenericObject) -->
  <Form
    :validation-schema="schema"
    :initial-values="initialValues"
    @submit="submit"
    v-slot="{ errors, isSubmitting, setFieldValue }"
  >
    <div class="max-w-2xl mx-auto p-4 space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Topic</label>
        <Field name="topic" as="input" type="text" class="w-full border rounded p-2" />
        <ErrorMessage name="topic" class="text-sm text-red-600" />
      </div>

      <Field name="short_detail" as="textarea" rows="3" class="w-full border rounded p-2" />
      <Field name="detail" as="textarea" rows="8" class="w-full border rounded p-2" />

      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-medium">Image (1 max)</label>
          <span class="text-xs text-gray-500">Optional</span>
        </div>
        <ImageUpload
          :limit="1"
          @update:modelValue="(arr) => setFieldValue('image', (arr || []).slice(0, 1))"
        />
        <ErrorMessage name="image" class="text-sm text-red-600" />
      </div>

      <div class="pt-2 flex gap-3">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="rounded bg-indigo-600 text-white px-4 py-2 disabled:opacity-60"
        >
          {{ isSubmitting ? 'Creating…' : 'Create' }}
        </button>
        <router-link :to="{ name: 'news-view' }" class="rounded border px-4 py-2"
          >Cancel</router-link
        >
      </div>
    </div>
  </Form>
</template>
