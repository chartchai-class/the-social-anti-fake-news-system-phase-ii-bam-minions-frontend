<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import CommentService from '@/services/CommentService'
import type { Comment, News } from '@/types'
import CommentCard from '@/components/CommentCard.vue'

const props = defineProps<{
  news: News
  page: number
  pageSize: number
}>()

import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const comments = ref<Comment[]>([])

const totalComments = ref(0)

const page = computed(() => props.page)
const pageSize = computed(() => props.pageSize)

const hasPrev = computed(() => page.value > 1)
const hasNext = computed(() => page.value < totalPages.value)

const currentPage = ref<number>(props.page || 1)
const currentPageSize = ref<number>(props.pageSize || 5)

const totalPages = computed(() => {
  const size = currentPageSize.value > 0 ? currentPageSize.value : 1
  const pages = Math.ceil(totalComments.value / size)
  return pages === 0 ? 1 : pages
})

const pages = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1)
})

function loadComments() {
  CommentService.getByNews(props.news.id, pageSize.value, page.value)
    .then((res) => {
      comments.value = res.data
      totalComments.value = Number(res.headers['x-total-count'] || 0)
    })
    .catch((err) => {
      console.error('loadComments error:', err)
    })
}

watch(
  () => [props.page, props.pageSize],
  ([newPage, newSize]) => {
    const pageNorm = newPage && newPage > 0 ? newPage : 1
    const sizeNorm = newSize && newSize > 0 ? newSize : 5

    const sizeChanged = sizeNorm !== currentPageSize.value
    const pageChanged = pageNorm !== currentPage.value

    if (!sizeChanged && !pageChanged) return

    if (sizeChanged) {
      currentPageSize.value = sizeNorm
      currentPage.value = 1
    } else if (pageChanged) {
      currentPage.value = pageNorm
    }

    loadComments()
  }
)

const showConfirm = ref(false)
const pendingDeleteId = ref<number | null>(null)
const pendingDeletePreview = ref('')

const deletingId = ref<number | null>(null)
const deleteErrorId = ref<number | null>(null)

const noticeMessage = ref('')
const noticeType = ref<'success' | 'error'>('success')
const noticeVisible = ref(false)

function showNotice(msg: string, type: 'success' | 'error') {
  noticeMessage.value = msg
  noticeType.value = type
  noticeVisible.value = true
  setTimeout(() => {
    noticeVisible.value = false
  }, 2500)
}

function recomputeNewsStatus() {
  if (props.news.notFakeCount > props.news.fakeCount) {
    // eslint-disable-next-line vue/no-mutating-props
    props.news.status = 'NOT_FAKE'
  } else if (props.news.fakeCount > props.news.notFakeCount) {
    // eslint-disable-next-line vue/no-mutating-props
    props.news.status = 'FAKE'
  } else {
    // eslint-disable-next-line vue/no-mutating-props
    props.news.status = 'TIE'
  }
}

function askDeleteComment(id: number, previewText: string) {
  pendingDeleteId.value = id
  pendingDeletePreview.value = previewText
  showConfirm.value = true
}

function cancelDeleteComment() {
  showConfirm.value = false
  pendingDeleteId.value = null
  pendingDeletePreview.value = ''
  deleteErrorId.value = null
}

function confirmDeleteComment() {
  if (pendingDeleteId.value === null) {
    cancelDeleteComment()
    return
  }

  const idToDelete = pendingDeleteId.value

  // ปิด modal ก่อน
  showConfirm.value = false
  pendingDeleteId.value = null

  // ล้าง preview
  pendingDeletePreview.value = ''

  // ทำงานหลัก
  onDeleteComment(idToDelete)
}

function onDeleteComment(commentId: number) {
  deleteErrorId.value = null
  deletingId.value = commentId

  // --- 1) optimistic update comment list
  // หา comment ที่จะถูกลบก่อน เพื่อใช้ปรับคะแนนข่าว
  const target = comments.value.find((c) => c.id === commentId)
  if (target) {
    // update score บนข่าวทันที
    // สมมติว่า comment.voteLabel === 'NOT_FAKE' หมายถึงโหวตสนับสนุนว่า "ไม่ใช่ข่าวปลอม"
    if (target.voteLabel === 'NOT_FAKE') {
      // eslint-disable-next-line vue/no-mutating-props
      props.news.notFakeCount = Math.max(props.news.notFakeCount - 1, 0)
    } else if (target.voteLabel === 'FAKE') {
      // eslint-disable-next-line vue/no-mutating-props
      props.news.fakeCount = Math.max(props.news.fakeCount - 1, 0)
    }

    // คำนวณสถานะใหม่
    recomputeNewsStatus()
  }

  // ตัดคอมเมนต์ออกจาก list ในจอทันที (optimistic)
  comments.value = comments.value.filter((c) => c.id !== commentId)

  // ลด totalComments ในจอทันทีด้วย
  if (totalComments.value > 0) {
    totalComments.value = totalComments.value - 1
  }

  // --- 2) call API ลบจริง
  return CommentService.deleteComment(commentId)
    .then(() => {
      showNotice('Comment deleted.', 'success')
      // reload อีกรอบจาก server เพื่อ sync ความจริง
      return loadComments()
    })
    .catch(() => {
      showNotice('Failed to delete comment.', 'error')
      deleteErrorId.value = commentId
      // reload ก็ยังควรทำ เพื่อคืน state ให้ตรงกับ backend
      return loadComments()
    })
    .finally(() => {
      deletingId.value = null
    })
}


onMounted(() => {
  loadComments()
})
</script>

<template>
  <div class="flex justify-center px-4 py-8">

    <!-- ===== Modal confirm delete comment ===== -->
    <div
      v-if="showConfirm"
      class="fixed top-6 left-1/2 -translate-x-1/2 z-[1000]
             w-[90%] max-w-sm
             bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200
             p-4 flex flex-col gap-3"
    >
      <div class="text-sm font-semibold text-gray-800">
        Delete this comment?
      </div>

      <div class="text-xs text-gray-600 break-words line-clamp-2">
        {{ pendingDeletePreview }}
      </div>

      <div class="flex justify-end gap-2 text-xs font-medium">
        <button
        
          class="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          @click="cancelDeleteComment"
        >
          Cancel
        </button>
        <button 
          class="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
          @click="confirmDeleteComment"
         
        >
          Delete
        </button>
       
      </div>
    </div>

    <!-- ===== Toast notice ===== -->
    <div
      v-if="noticeVisible"
      class="fixed top-6 left-1/2 -translate-x-1/2 z-[3000] pointer-events-none"
    >
      <div
        class="text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg text-center min-w-[200px]"
        :class="noticeType === 'success' ? 'bg-green-600' : 'bg-red-600'"
      >
        {{ noticeMessage }}
      </div>
    </div>


    <div
      class="w-full max-w-6xl xl:max-w-7xl rounded-2xl backdrop-blur shadow-xl ring-1 ring-black/5 overflow-hidden"
    >
      <div class="p-6 md:p-8 space-y-4">
        
        <div class="flex flex-wrap items-center gap-2">
        
          <span
            class="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs ring-1 ring-gray-200 font-bold text-[14px]"
          >
            Post by {{ news.reporter.firstname }} {{ news.reporter.lastname }}
          </span>
          <span
            class="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs ring-1 ring-gray-200 font-bold text-[14px]"
          >
            Post on {{ news.created_at }}
          </span>
          
          <div class="ml-auto flex items-center gap-2 text-[12px] font-medium">
  <div
    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 bg-white text-green-600"
  >
    <span class="uppercase tracking-wide font-bold text-[18px]">
      NOT FAKE
    </span>
    <span class="text-[18px] font-semibold">
      {{ news.notFakeCount }}
    </span>
  </div>

  <div
    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 bg-white text-red-600"
  >
    <span class="uppercase tracking-wide font-bold text-[18px]">
      FAKE
    </span>
    <span class="text-[18px] font-semibold">
      {{ news.fakeCount }}
    </span>
  </div>
</div>


        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          {{ news.topic }}
        </h1>
      </div>

      <div class="px-6 md:px-8 mb-6">
        <img
          v-if="news.image && news.image.length > 0"
          :src="news.image[0]"
          alt="News Image"
          class="w-full h-auto rounded-lg shadow"
        />
      </div>
      <div class="px-6 md:px-8 mb-6">
        <h1 class="text-xl md:text-2xl font-semibold mb-4 text-gray-900">
          {{ news.shortDetail }}
        </h1>
      </div>

      <div class="px-6 md:px-8 pb-8">
        <p class="text-gray-800 leading-relaxed">
          {{ news.detail }}
        </p>
      </div>
    </div>


      <div class="ml-8 w-full max-w-sm">
      <h2 class="text-base md:text-lg font-bold tracking-tight text-white text-center py-2">
        Comments
      </h2>

      <div class="space-y-3">
        <CommentCard
          v-for="c in comments"
          :key="c.id"
          :comment="c"
          :isDeleting="deletingId === c.id"
          :hasError="deleteErrorId === c.id"
          :onRequestDelete="askDeleteComment"
        />
      </div>

      <div class="mt-6">
        <div class="flex justify-center text-sm font-medium text-gray-200">
          Page {{ currentPage }} of {{ totalPages }}
          <span v-if="totalComments">&nbsp;•&nbsp;{{ totalComments }} comments total</span>
        </div>


        <div class="flex justify-center items-center mt-8 space-x-2 select-none text-xs">
  <!-- Prev -->
  <router-link
    v-if="hasPrev"
    :to="{
      name: 'news-detail-view',
      params: { id: news.id },
      query: { page: currentPage - 1, pageSize: currentPageSize }
    }"
    class="flex items-center"
  >
    <button
      class="min-w-[90px] h-9 flex items-center justify-center rounded border text-white hover:bg-gray-200 hover:text-black transition"
    >
      ‹ Prev Page
    </button>
  </router-link>

  <!-- page numbers -->
  <div class="flex space-x-2 mx-2">
    <router-link
      v-for="num in pages"
      :key="num"
      :to="{
        name: 'news-detail-view',
        params: { id: news.id },
        query: { page: num, pageSize: currentPageSize }
      }"
    >
      <button
        class="w-9 h-9 flex items-center justify-center border transition"
        :class="[
          num === currentPage
            ? 'text-black bg-white font-bold'
            : 'text-gray-200 bg-gray-700 hover:bg-gray-500'
        ]"
      >
        {{ num }}
      </button>
    </router-link>
  </div>

  <!-- Next -->
  <router-link
    v-if="hasNext"
    :to="{
      name: 'news-detail-view',
      params: { id: news.id },
      query: { page: currentPage + 1, pageSize: currentPageSize }
    }"
    class="flex items-center"
  >
    <button
      class="min-w-[90px] h-9 flex items-center justify-center border rounded text-white hover:bg-gray-200 hover:text-black transition"
    >
      Next Page ›
    </button>
  </router-link>
</div>
      </div>
    </div>
  </div>
</template>
