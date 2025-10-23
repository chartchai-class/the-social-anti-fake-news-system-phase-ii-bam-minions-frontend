<script setup lang="ts">
import Uploader from 'vue-media-upload'
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const authorizeHeader = computed(() => ({
  Authorization: authStore.authorizationHeader
}))

interface Props {
  modelValue?: string[]
}

type MediaItem = { name: string }

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
})

const convertStringToMedia = (str: string[]): MediaItem[] => {
  return str.map((element: string) => ({ name: element }))
}

const emit = defineEmits(['update:modelValue'])

const convertMediaToString = (media: MediaItem[]): string[] => {
  return media.map((m) => m.name)
}


const media = ref<MediaItem[]>(convertStringToMedia(props.modelValue))
const uploadUrl = ref(import.meta.env.VITE_UPLOAD_URL)


const onChanged = (files: MediaItem[]) => {
  emit('update:modelValue', convertMediaToString(files))
}
</script>

<template>
  <Uploader :server="uploadUrl" @change="onChanged" :media="media" :headers="authorizeHeader"/>
</template>
