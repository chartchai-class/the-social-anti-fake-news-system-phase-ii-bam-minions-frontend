<!-- src/components/UserCard.vue -->
<script setup lang="ts">
import type { AdminUser, Role } from '@/types'
import UserService from '@/services/UserService'
import { useUsersBus } from '@/stores/users'

import { ref, watch } from 'vue'

const props = defineProps<{ user: AdminUser }>()
const bus = useUsersBus()




const localEnabled = ref<boolean>(false)
const localRoles   = ref<Role[]>([])

watch(() => props.user, (u) => {
  localEnabled.value = !!u?.enabled
  localRoles.value   = Array.isArray(u?.roles) ? (u!.roles as Role[]) : []
}, { immediate: true })

const saving = ref(false)
const err = ref<string | null>(null)

/* actions */
function setRoles(roles: Role[]) { localRoles.value = roles }
function toggleEnabled() { localEnabled.value = !localEnabled.value }
function save() {
  if (saving.value ) return
  saving.value = true
  err.value = null

  UserService.updateRoles(props.user.id, localRoles.value, localEnabled.value)
    .then(() => { bus.reload() })
    .catch((e: any) => { err.value = e?.response?.data?.message || e?.message || 'Update failed' })
    .finally(() => { saving.value = false })
}
</script>

<template>
>
  <div v-if="!user" class="w-full max-w-2xl my-3 p-4 border rounded bg-white shadow-sm">Loading…</div>
  <div v-else class="w-full max-w-2xl my-3 p-4 border rounded bg-white shadow-sm">


    <div class="mt-2 mb-3">
    <span>
        {{ user.firstname }} {{ user.lastname }} ({{ user.username }})
    </span>
      <span class="text-[11px] font-semibold px-2 py-0.5 rounded uppercase"
            :class="user.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'">
        {{ user.enabled ? 'ENABLED' : 'DISABLED' }}
      </span>
      <span class="text-[11px] text-gray-500 ml-2"></span>
    </div>

    <div v-if="user?.roles?.includes('ROLE_ADMIN')" class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
      Cannot manage Admin
    </div>

    <div v-else class="border-t pt-3">
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span class="font-medium">Set roles:</span>
        <button exact-active-class="text-green-500" class="px-2 py-1 border rounded hover:bg-gray-50" @click="setRoles(['ROLE_MEMBER'] ) ">Make Member</button>
        <button exact-active-class="text-green-500" class="px-2 py-1 border rounded hover:bg-gray-50" @click="setRoles(['ROLE_READER'])">Make Reader</button>

        <span class="ml-3 font-medium">Enabled:</span>
        <button class="px-2 py-1 border rounded hover:bg-gray-50"
                :class="localEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
                @click="toggleEnabled" exact-active-class="text-green-500">
          {{ localEnabled ? 'ENABLED' : 'DISABLED' }}
        </button>

        <span class="ml-3 text-gray-600">Pending roles:</span>
        <span class="px-2 py-0.5 rounded border bg-amber-50 text-amber-800">{{ localRoles.join(', ') || '—' }}</span>

        <button class="ml-auto px-3 py-1.5 rounded bg-black text-white disabled:opacity-60"
                :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
      <div v-if="err" class="mt-2 text-xs text-red-600">{{ err }}</div>
    </div>
  </div>
</template>
