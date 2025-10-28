<script setup lang="ts">
import type { AdminUser, Role } from '@/types'
import UserService from '@/services/UserService'
import { useUsersBus } from '@/stores/users'
import { ref, watch, computed } from 'vue'

const props = defineProps<{ user: AdminUser }>()
const bus = useUsersBus()

// keep enabled only for read-only display + passing through to backend
const localEnabled = ref(false)
const localRoles = ref<Role[]>([])
const saving = ref(false)
const err = ref<string | null>(null)
const ok = ref<string | null>(null) // toast text

watch(
  () => props.user,
  (u) => {
    localEnabled.value = !!u?.enabled
    localRoles.value = Array.isArray(u?.roles) ? (u!.roles as Role[]) : []
  },
  { immediate: true },
)

const isAdmin = computed(
  () => Array.isArray(props.user?.roles) && (props.user!.roles as Role[]).includes('ROLE_ADMIN'),
)

const currentRole = computed<Role | null>(() =>
  localRoles.value?.length ? (localRoles.value[0] as Role) : null,
)

function dismissOk() {
  ok.value = null
}

function sendUpdate(rollback?: () => void) {
  if (saving.value) return
  saving.value = true
  err.value = null
  UserService.updateRoles(props.user.id, localRoles.value, localEnabled.value)
    .then(() => {
      ok.value = 'Saved'
      bus.reload()
      setTimeout(() => (ok.value = null), 2000)
    })
    .catch((e: any) => {
      err.value = e?.response?.data?.message || e?.message || 'Update failed'
      rollback?.()
    })
    .finally(() => (saving.value = false))
}

function setRoleImmediate(role: Role) {
  if (saving.value || currentRole.value === role) return
  const prev = [...localRoles.value]
  localRoles.value = [role]
  sendUpdate(() => {
    localRoles.value = prev
  })
}
</script>

<template>
  <section class="max-w-2xl w-full my-6">
    <div v-if="!user" class="p-4 rounded-xl bg-white">Loading…</div>

    <article v-else class="rounded-xl bg-white overflow-hidden">
      <!-- Header -->
      <header class="p-4 sm:p-5 flex items-center gap-3">
        <div
          class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 select-none"
        >
          {{ (user.firstname?.[0] || '').toUpperCase()
          }}{{ (user.lastname?.[0] || '').toUpperCase() }}
        </div>
        <div class="min-w-0">
          <h3 class="text-sm font-semibold text-gray-900 truncate">
            {{ user.firstname }} {{ user.lastname }}
          </h3>
          <p class="text-xs text-gray-500 truncate">@{{ user.username }}</p>
        </div>
        <!-- read-only status pill -->
        <span
          class="ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1"
          :class="
            localEnabled
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              : 'bg-gray-100 text-gray-700 ring-gray-300'
          "
        >
          {{ localEnabled ? 'ENABLED' : 'DISABLED' }}
        </span>
      </header>

      <!-- Inline error -->
      <div v-if="err" class="px-4 sm:px-5 py-2" aria-live="polite" role="alert">
        <div class="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
          {{ err }}
        </div>
      </div>

      <!-- Body -->
      <div class="p-4 sm:p-5 space-y-4">
        <div
          v-if="isAdmin"
          class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 text-center"
        >
          Cannot manage Admin
        </div>

        <div v-else class="space-y-3">
          <!-- Role row (only control left) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
            <label class="text-sm text-gray-700">Role</label>
            <div class="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                class="text-sm px-2 py-1 rounded border disabled:opacity-60"
                :class="
                  currentRole === 'ROLE_MEMBER'
                    ? 'bg-purple-800 text-white border-purple-200'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-300'
                "
                @click="setRoleImmediate('ROLE_MEMBER')"
                :disabled="saving || currentRole === 'ROLE_MEMBER'"
              >
                Member
              </button>

              <button
                type="button"
                class="text-sm px-2 py-1 rounded border disabled:opacity-60"
                :class="
                  currentRole === 'ROLE_READER'
                    ? 'bg-yellow-800 text-white border-yellow-800'
                    : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-300'
                "
                @click="setRoleImmediate('ROLE_READER')"
                :disabled="saving || currentRole === 'ROLE_READER'"
              >
                Reader
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>

    <!-- Floating "Saved" toast -->
    <transition
      enter-active-class="transform transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transform transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="ok"
        class="fixed bottom-4 right-4 z-50 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 shadow"
        role="status"
        aria-live="polite"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mt-[2px] text-emerald-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-7.182 7.182a1 1 0 01-1.414 0L3.293 9.071a1 1 0 011.414-1.414l3.111 3.111 6.475-6.475a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="text-sm font-medium text-emerald-800">{{ ok }}</div>
      </div>
    </transition>
  </section>
</template>
