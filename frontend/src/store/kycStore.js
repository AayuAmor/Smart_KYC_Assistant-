import { create } from 'zustand'

const DEFAULT_FORM = {
  /* Personal */
  full_name: '', dob: '', gender: '', document_type: 'citizenship',

  /* Document */
  id_number: '',

  /* Permanent address (structured) */
  permanent_province: '', permanent_district: '', permanent_municipality: '',
  permanent_ward: '', permanent_tole: '',

  /* Current address */
  current_same_as_permanent: true,
  current_province: '', current_district: '', current_municipality: '',
  current_ward: '', current_tole: '',

  /* Legacy flat address — kept for API backward-compatibility */
  address: '',

  /* Contact */
  phone: '', email: '',

  /* Extended */
  pan: '', alternate_phone: '', occupation: '',
}

export const useKYCStore = create((set) => ({
  user: { name: 'Aayush', email: '' },
  setUser: (u) => set({ user: u }),

  docFile: null,
  docPreviews: {},
  setDocFile: (f, previews) => set({ docFile: f, docPreviews: previews }),

  ocrResult: null,
  setOcrResult: (r) => set({ ocrResult: r }),

  formData: { ...DEFAULT_FORM },
  setFormData: (d) => set({ formData: d }),

  kycId: null,
  kycStatus: 'pending',
  rejectionReason: null,
  setKycId: (id) => set({ kycId: id }),
  setKycStatus: (s, reason = null) => set({ kycStatus: s, rejectionReason: reason }),

  reset: () => set({
    docFile: null, docPreviews: {}, ocrResult: null, kycId: null,
    kycStatus: 'pending', rejectionReason: null,
    formData: { ...DEFAULT_FORM },
  }),
}))
