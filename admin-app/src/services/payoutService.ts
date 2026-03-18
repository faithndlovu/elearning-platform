import apiClient from './apiClient'

export const getAllRequests = (filters?: { status?: string }) =>
  apiClient.get('/payouts/requests', { params: filters })

export const approveRequest = (id: string) =>
  apiClient.post(`/payouts/requests/${id}/approve`)

export const rejectRequest = (id: string) =>
  apiClient.post(`/payouts/requests/${id}/reject`)