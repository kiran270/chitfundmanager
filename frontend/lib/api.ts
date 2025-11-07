import axios from 'axios'

const API_BASE_URL = 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
}

// Chit Groups API
export const chitGroupsAPI = {
  getAll: () => api.get('/chitgroups'),
  create: (groupData: any) => api.post('/chitgroups', groupData),
  getMembers: (groupId: string) => api.get(`/chitgroups/${groupId}/members`),
  addMember: (groupId: string, memberData: any) => 
    api.post(`/chitgroups/${groupId}/add-member`, memberData),
  getUsers: () => api.get('/users'),
  getAuctions: (groupId: string) => api.get(`/chitgroups/${groupId}/auctions`),
  createAuction: (groupId: string, auctionData: any) => 
    api.post(`/chitgroups/${groupId}/auctions`, auctionData),

  activateGroup: (groupId: string) => 
    api.post(`/chitgroups/${groupId}/activate`),
  deactivateGroup: (groupId: string) => 
    api.post(`/chitgroups/${groupId}/deactivate`),
  browseAll: () => api.get('/chitgroups/browse'),

}

// Member API
export const memberAPI = {
  getDashboard: () => api.get('/member/dashboard'),
  getGroupDetails: (groupId: string) => api.get(`/member/groups/${groupId}`),
}

export default api