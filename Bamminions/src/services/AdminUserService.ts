import apiClient from './AxiosCLient'
import type { AdminControlDTO, Role } from '@/types'

const AdminUserService = {
  // GET /admin?_limit=10&_page=1
  getUsers(params: { _page: number; _limit: number }) {
    return apiClient.get<AdminControlDTO[]>('/admin', { params })
  },

  // PUT /admin/:id/roles?enabled=true   with body: ["ADMIN","MEMBER"]
  updateRoles(id: number, roles: Role[], enabled?: boolean) {
    const params = enabled === undefined ? {} : { enabled }
    return apiClient.put<AdminControlDTO>(`/admin/${id}/roles`, roles, { params })
  },
}

export default AdminUserService
