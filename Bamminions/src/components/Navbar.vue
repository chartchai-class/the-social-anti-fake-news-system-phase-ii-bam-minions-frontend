<script setup lang="ts">
import { ref } from 'vue'
const open = ref(false)

import { useAuthStore } from '@/stores/auth.ts'
const authStore = useAuthStore()
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccountPlus, mdiLogin, mdiAccount, mdiLogout } from '@mdi/js'
import { useRouter } from 'vue-router'
const router = useRouter()
function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>
<template>
  <nav
    class="fixed inset-x-0 top-0 z-50 h-16 py-2 px-8 flex items-center justify-between bg-gray-800 text-white"
  >
    <router-link :to="{ name: 'news-view' }" class="flex items-center text-2xl font-bold">
      <img src="@/assets/BamMinionsLogo.png" alt="Bamminions" class="h-15 w-auto" />
      <span class="px-3 ml-2 text-xl font-bold">Bam Minions</span>
    </router-link>
    <ul v-if="!authStore.currentUserName" class="flex navbar-nav ml-auto">
      <li class="nav-item px-2">
        <router-link to="/register" class="nav-link">
          <div class="flex items-center">
            <SvgIcon type="mdi" :path="mdiAccountPlus" />
            <span class="ml-3">Sign Up</span>
          </div>
        </router-link>
      </li>
      <li class="nav-item px-2">
        <router-link to="/login" class="nav-link">
          <div class="flex items-center">
            <SvgIcon type="mdi" :path="mdiLogin" />
            <span class="ml-3">Login</span>
          </div>
        </router-link>
      </li>
    </ul>
    <ul v-if="authStore.currentUserName" class="flex navbar-nav ml-auto">
      <li class="nav-item px-2">
        <router-link :to="{ name: 'admin-user' }" class="nav-link">
          <div class="flex items-center">
            <SvgIcon type="mdi" :path="mdiAccount" />
            <span class="ml-3">{{ authStore.currentUserName }}</span>
            <img v-if="authStore.currentUserImage" :src="authStore.currentUserImage" alt="User Avatar" class="ml-2 h-8 w-8 rounded-full" />
          </div>
        </router-link>
      </li>

      <li class="nav-item px-2">
        <a class="nav-link hover:cursor-pointer" @click="logout">
          <div class="flex items-center">
            <SvgIcon type="mdi" :path="mdiLogout" />
            <span class="ml-3">LogOut</span>
          </div>
        </a>
      </li>
    </ul>
  </nav>
</template>
