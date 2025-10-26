import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import NewsView from '@/views/NewsView.vue'
import NewsDetailView from '@/views/News/NewsDetailView.vue'
import NewsService from '@/services/NewsService'
import { useNewsStore } from '@/stores/new'
import { createRouter, createWebHistory } from 'vue-router'
import NewsLayoutView from '@/views/News/NewsLayoutView.vue'
import NewsVoteView from '@/views/News/NewsVoteView.vue'
import NewFromView from '@/views/form/NewFromView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'news-view',
      component: NewsView,
      props: (route) => {
        const page = parseInt((route.query.page as string) || '1')
        const pageSize = parseInt((route.query.pageSize as string) || '6')
        return {
          page: isNaN(page) ? 1 : page,
          pageSize: isNaN(pageSize) ? 6 : pageSize,
        }
      },
    },
    {
      path: '/news/:id',
      name: 'news-detail',
      component: NewsLayoutView,
      props: true,
      beforeEnter: (to) => {
        const id = parseInt(to.params.id as string)
        const newsStore = useNewsStore()
        return NewsService.getNew(id)
          .then((response) => {
            //setup the data for event
            newsStore.setNews(response.data)})
          .catch((error) => {
            console.error('Error fetching news:', error)
          })
      },
      children: [
        {
          path: '',
          name: 'news-detail-view',
          component: NewsDetailView,
          props: (route) =>({
            page: parseInt((route.query.page as string) || '1'),
            pageSize: parseInt((route.query.pageSize as string) || '5'),
          }),
        },
        {
          path: 'vote',
          name: 'news-vote-view',
          component: NewsVoteView,
          props: true,
        },
      ]
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
    {
      path: '/add-news',
      name: 'add-news',
      component: NewFromView,
    },
  ],
})

export default router
