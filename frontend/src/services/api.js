import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({ baseURL: BASE, timeout: 30000 })

api.interceptors.response.use(
  r => r,
  e => Promise.reject(e?.response?.data?.detail || e.message || 'Request failed')
)

export async function uploadDocument(file) {
  const fd = new FormData()
  fd.append('file', file)
  const { data } = await api.post('/ocr/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function submitKYC(payload) {
  const { data } = await api.post('/kyc/submit', payload)
  return data
}

export async function getKYCStatus(kycId) {
  const { data } = await api.get(`/kyc/status/${kycId}`)
  return data
}

export async function sendChatMessage(question, kycContext = {}) {
  const { data } = await api.post('/chat/ask', { question, kyc_context: kycContext })
  return data
}
