import { create } from 'zustand'

export const useKYCStore = create((set) => ({
  user: { name: 'Aayush', email: '' },
  setUser: (u) => set({ user: u }),

  step: 1,
  setStep: (step) => set({ step }),

  docFile: null,
  docPreviews: {},
  setDocFile: (f, previews) => set({ docFile: f, docPreviews: previews }),

  ocrResult: null,
  extractedData: null,
  setOcrResult: (r) => set({ ocrResult: r, extractedData: r }),
  setExtractedData: (r) => set({ extractedData: r, ocrResult: r }),

  formData: { full_name:'', dob:'', id_number:'', address:'', phone:'', email:'', document_type:'citizenship' },
  setFormData: (d) => set({ formData: d }),

  kycId: null,
  kycStatus: 'pending',
  rejectionReason: null,
  setKycId: (id) => set({ kycId: id }),
  setKycStatus: (s, reason = null) => set({ kycStatus: s, rejectionReason: reason }),

  reset: () => set({
    step: 1,
    docFile: null, docPreviews: {}, ocrResult: null, extractedData: null, kycId: null,
    kycStatus: 'pending', rejectionReason: null,
    formData: { full_name:'', dob:'', id_number:'', address:'', phone:'', email:'', document_type:'citizenship' }
  }),
}))
