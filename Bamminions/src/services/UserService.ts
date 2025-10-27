import type { AxiosResponse } from 'axios'
import apiClient from '@/services/AxiosCLient'
import type { Role } from '@/types'

export default {
  
  getUsers(perPage: number, page: number) {
    return apiClient.get(`/admin?_limit=${perPage}&_page=${page}`)
  },

  
  updateRoles(id: number, roles: Role[], enabled?: boolean) {
    const params = typeof enabled === 'boolean' ? `?enabled=${enabled}` : ''
    return apiClient.put(`/admin/${id}/roles${params}`, roles)
  },
}
