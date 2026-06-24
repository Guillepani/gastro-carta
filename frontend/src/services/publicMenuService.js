import { apiRequest } from './apiClient.js'

export function getPublicMenu(slug, options = {}) {
  return apiRequest(`/public/restaurants/${encodeURIComponent(slug)}/menu`, options)
}
