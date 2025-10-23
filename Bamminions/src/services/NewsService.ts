import type { News as NewsType } from '@/types'
import apiClient from './AxiosCLient'
import type { AxiosResponse } from 'axios'

export default {
  getNews(perPage: number, page: number) {
    return apiClient.get('/news?_limit=' + perPage + '&_page=' + page)
  },

  getNew(id: number) {
    return apiClient.get('/news/' + id)
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  saveNews(news: NewsType) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...newsData } = news
    return apiClient.post('/news', newsData)
  },
  getNewsByKeyword(keyword: string, perPage: number, page: number) :
    Promise<AxiosResponse<NewsType[]>>{
      return apiClient.get<NewsType[]>('/news?title=' + keyword + '&_limit=' +
        perPage + '&_page=' + page, )
    }
}
