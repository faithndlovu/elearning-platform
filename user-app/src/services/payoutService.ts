import apiClient from './apiClient'

// Get the instructor's current virtual balance
export const getBalance = () =>
  apiClient.get('/payouts/balance')

// Request a payout for the current balance
export const requestPayout = () =>
  apiClient.post('/payouts/requests')

// Get payout request history
export const getPayoutRequests = () =>
  apiClient.get('/payouts/requests')