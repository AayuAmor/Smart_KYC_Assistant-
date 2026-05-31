import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_FORM = {
  full_name: '',
  dob: '',
  gender: '',
  document_type: 'citizenship',
  id_number: '',
  permanent_province: '',
  permanent_district: '',
  permanent_municipality: '',
  permanent_ward: '',
  permanent_tole: '',
  current_same_as_permanent: true,
  current_province: '',
  current_district: '',
  current_municipality: '',
  current_ward: '',
  current_tole: '',
  address: '',
  phone: '',
  email: '',
  pan: '',
  alternate_phone: '',
  occupation: '',
}

export const useKYCStore = create(
  persist(
    (set) => ({
      user: { name: '', email: '' },
      setUser: (u) => set({ user: u }),

      docFile: {},
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
        docFile: {},
        docPreviews: {},
        ocrResult: null,
        kycId: null,
        kycStatus: 'pending',
        rejectionReason: null,
        formData: { ...DEFAULT_FORM },
      }),
    }),
    {
      name: 'smart-kyc-session',
      partialise: (state) => ({
        kycId:           state.kycId,
        kycStatus:       state.kycStatus,
        rejectionReason: state.rejectionReason,
        formData:        state.formData,
        ocrResult:       state.ocrResult,
      }),
    }
  )
)
