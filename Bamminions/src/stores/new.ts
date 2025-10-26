import NewsService from '@/services/NewsService'
import type { NewsState, News } from '@/types'
import { defineStore } from 'pinia'
export const useNewsStore = defineStore('news', {
  state: (): NewsState => ({
    news: null,
  }),
  actions: {
    setNews(news: News): void {
      this.news = news
    },
    fetchNews(id: number) {
      return NewsService.getNew(id)
        .then((response) => {
          this.news = response.data
          return response.data
        })
        .catch((error) => {
          console.error('Error fetching news:', error)
          throw error
        })
    }
  },
})
