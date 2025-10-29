import { defineStore } from 'pinia'
import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { AdminUser , UserReporter } from '@/types'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})


export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') as string | null,
    user: (localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') as string)
      : null) as AdminUser | null,
  }),
  getters: {
    currentUserName(): string {
      return this.user?.firstname || ''
    },
    currentUserLastname(): string {
      return this.user?.lastname || ''
    },
    currentUserImage(): string[]{
      return this.user?.image || []
    },

    authorizationHeader(): string {
      return `Bearer ${this.token}`
    },

      isAdmin(): boolean {
     return this.user?.roles.includes('ROLE_ADMIN') || false
    },
    isMember(): boolean {
      return this.user?.roles.includes('ROLE_MEMBER') || false
    },

  },
  actions: {
    login(email: string, password: string) {
      return apiClient
        .post('/api/v1/auth/authenticate', {
          username: email,
          password: password,
        })
        .then((response) => {
          this.token = response.data.access_token
          this.user = response.data.user

          console.log(this.user)
          localStorage.setItem('access_token', this.token as string)
          localStorage.setItem('user', JSON.stringify(this.user))
          return response
        })
    },

    reload(token: string, user: UserReporter) {
      this.token = token
      this.user = user
    },

    logout() {
      console.log('logout')
      this.token = null
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    },

    register(firstname: string, lastname: string, email: string, password: string , image: string[]) {
      return apiClient
        .post('/api/v1/auth/register', {
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: password,
          image: image,
        })
        .then((response) => {
          console.log('Registered', response)
          this.token = response.data.access_token
          this.user = response.data.user
          localStorage.setItem('access_token', this.token as string)
          localStorage.setItem('user', JSON.stringify(this.user))
          return response
        })
    },


  },
})
