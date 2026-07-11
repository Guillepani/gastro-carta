import {
  apiRequest,
  clearStoredAuthToken,
  getStoredAuthToken,
  storeAuthToken,
} from './apiClient.js'

export function getCurrentAuthToken() {
  return getStoredAuthToken()
}

export function saveAuthSession(token) {
  storeAuthToken(token)
}

export function clearAuthSession() {
  clearStoredAuthToken()
}

export function registerAdmin(payload, options = {}) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal: options.signal,
  })
}

export function loginAdmin(payload, options = {}) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal: options.signal,
  })
}

export function getAuthenticatedAdmin(options = {}) {
  return apiRequest('/auth/me', {
    signal: options.signal,
  })
}
