import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import NewsView from '@/views/NewsView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'news-view',
      component: NewsView,
      props: (route) => {
        const page = parseInt((route.query.page as string) || '1')
        const pageSize = parseInt((route.query.pageSize as string) || '2')
        return {
          page: isNaN(page) ? 1 : page,
          pageSize: isNaN(pageSize) ? 2 : pageSize,
        }
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
  ],
})

export default router
