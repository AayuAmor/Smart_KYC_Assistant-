import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles,
  User, Phone, CreditCard,
} from 'lucide-react'
import { useKYCStore } from '../store/kycStore.js'
import { submitKYC } from '../services/api.js'
import { Btn, StepHeader } from '../components/UI.jsx'

/* ---------- Validation — phone & email are optional ---------- */
function validate(f) {
  const e = {}
  if (!f.full_name.trim()) e.full_name = 'Full name is required'
  if (!f.dob)              e.dob       = 'Date of birth is required'
  if (!f.id_number.trim()) e.id_number = 'ID number is required'
  if (!f.address.trim())   e.address   = 'Address is required'
  if (f.phone && !f.phone.match(/^\+?[0-9]{10,15}$/))
                            e.phone    = 'Enter a valid phone number'
  if (f.email && !f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
                            e.email    = 'Enter a valid email address'
  const age = (Date.now() - new Date(f.dob)) / (1000 * 60 * 60 * 24 * 365)
  if (f.dob && (age < 16 || age > 120)) e.dob = 'Enter a valid date of birth'
  return e
}

/* ---------- Reusable: section card with icon header ---------- */
function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(16,24,40,0.07)] border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-primary" />
        </div>
        <h3 className="text-sm font-bold text-text-dark tracking-wide">{title}</h3>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  )
}

/* ---------- Reusable: labelled field wrapper ---------- */
function FormField({ label, error, optional = false, autoFilled = false, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm font-semibold text-text-dark">{label}</label>
        {optional && (
          <span className="text-xs text-text-gray font-normal">(Optional)</span>
        )}
        <AnimatePresence>
          {autoFilled && (
            <motion.span
              key="autofill-badge"
              initial={{ opacity: 0, scale: 0.75, x: -4 }}
              animate={{ opacity: 1, scale: 1,    x:  0 }}
              exit={{   opacity: 0, scale: 0.75        }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
            >
              <CheckCircle2 size={9} strokeWidth={2.5} />
              Auto-filled
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {children}

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y:  0 }}
            exit={{   opacity: 0, y: -4 }}
            className="flex items-center gap-1 text-xs text-error font-medium"
          >
            <AlertTriangle size={11} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   Main KYCForm screen
   ================================================================ */
export default function KYCForm() {
  const nav = useNavigate()
  const { formData, setFormData, ocrResult, setKycId, setKycStatus } = useKYCStore()
  const [errors,     setErrors]     = useState({})
  const [loading,    setLoading]    = useState(false)
  const [step,       setStep]       = useState('form')
  const [autoFilled, setAutoFilled] = useState(new Set())
  const [showBanner, setShowBanner] = useState(false)
  const ocrApplied = useRef(false)
  const MOCK = import.meta.env.VITE_ENABLE_API !== 'true'

  /* Highlight OCR-extracted fields on mount (OCRProcessing may have pre-filled them) */
  useEffect(() => {
    if (!ocrResult || ocrApplied.current) return
    ocrApplied.current = true

    const fieldMap = {
      full_name: ocrResult.name,
      dob:       ocrResult.dob,
      id_number: ocrResult.id_number,
      address:   ocrResult.address,
    }
    const updates = {}
    const filled  = new Set()

    for (const [key, val] of Object.entries(fieldMap)) {
      if (val) {
        if (!formData[key]) updates[key] = val  // fill if not already set
        filled.add(key)                          // always highlight OCR fields
      }
    }

    if (Object.keys(updates).length) setFormData({ ...formData, ...updates })
    if (filled.size) {
      setAutoFilled(filled)
      setShowBanner(true)
      setTimeout(() => setAutoFilled(new Set()), 4000)
    }
  }, [ocrResult])

  function handle(field, val) {
    setFormData({ ...formData, [field]: val })
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n })
    // Remove highlight once the user starts editing
    setAutoFilled(prev => { const n = new Set(prev); n.delete(field); return n })
  }

  function handleNext() {
    const e = validate(formData)
    if (Object.keys(e).length) { setErrors(e); return }
    setStep('review')
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      let data
      if (MOCK) {
        await new Promise(r => setTimeout(r, 1500))
        data = { kyc_id: 'KYC-' + Date.now(), status: 'submitted' }
      } else {
        data = await submitKYC(formData)
      }
      setKycId(data.kyc_id)
      setKycStatus('submitted')
      setStep('done')
    } finally { setLoading(false) }
  }

  /* Dynamic classes for text inputs */
  const inputCls = (field) => [
    'w-full bg-white border-2 rounded-xl px-4 py-3 text-sm text-text-dark',
    'placeholder:text-slate-400 outline-none transition-all duration-300',
    'focus:ring-2 focus:ring-primary/15',
    errors[field]
      ? 'border-error focus:border-error bg-red-50/30'
      : autoFilled.has(field)
      ? 'border-primary/40 bg-primary/5 focus:border-primary autofill-pop'
      : 'border-slate-200 focus:border-primary hover:border-slate-300',
  ].join(' ')

  const selectCls = [
    'w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3',
    'text-sm text-text-dark outline-none transition-all duration-200',
    'focus:border-primary focus:ring-2 focus:ring-primary/15 hover:border-slate-300',
  ].join(' ')

  /* -------- DONE step -------- */
  if (step === 'done') return (
    <div className="page-root flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="max-w-sm w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 green-gradient shadow-xl shadow-primary/25"
        >
          <CheckCircle2 size={48} color="#fff" strokeWidth={2} />
        </motion.div>
        <h2 className="text-2xl font-black text-text-dark mb-2">KYC Submitted!</h2>
        <p className="text-sm text-text-gray mb-8 leading-relaxed px-2">
          Your application is under review. Verification typically takes 1–3 business days.
          We'll notify you once complete.
        </p>
        <div className="flex gap-3">
          <Btn full onClick={() => nav('/kyc/tracking')} variant="primary">Track Status</Btn>
          <Btn full onClick={() => nav('/chat')} variant="outline">Ask AI</Btn>
        </div>
      </motion.div>
    </div>
  )

  /* -------- REVIEW step -------- */
  if (step === 'review') {
    const rows = [
      ['Full Name',     formData.full_name],
      ['Date of Birth', formData.dob],
      ['ID Number',     formData.id_number],
      ['Address',       formData.address],
      ['Phone',         formData.phone || '—'],
      ['Email',         formData.email || '—'],
    ]
    return (
      <div className="page-root pb-8">
        <StepHeader
          steps={['Upload', 'Process', 'Details', 'Face ID', 'Submit']}
          current={3}
          onBack={() => setStep('form')}
          title="Review Details"
        />
        <div className="max-w-[480px] mx-auto px-4 py-5 space-y-4">
          <p className="text-sm text-text-gray">
            Confirm your details are correct before face verification.
          </p>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_2px_12px_rgba(16,24,40,0.07)]">
            {rows.map(([label, value], i) => (
              <div
                key={label}
                className="flex justify-between items-center px-5 py-3.5"
                style={{
                  borderBottom: i < rows.length - 1 ? '1px solid #F3F4F6' : 'none',
                  background: i % 2 ? '#FAFAFA' : '#fff',
                }}
              >
                <span className="text-xs font-semibold text-text-gray">{label}</span>
                <span className="text-sm font-bold text-text-dark text-right max-w-[58%] break-words leading-snug">
                  {value || '—'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3.5">
            <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Ensure all details match your official document. Incorrect information may cause verification delays.
            </p>
          </div>

          <Btn full size="lg" onClick={() => nav('/kyc/face-verify')}>
            Confirm & Start Face Verification
            <ArrowRight size={16} strokeWidth={2.5} />
          </Btn>
        </div>
      </div>
    )
  }

  /* -------- FORM step -------- */
  return (
    <div className="page-root pb-8">
      <StepHeader
        steps={['Upload', 'Process', 'Details', 'Face ID', 'Submit']}
        current={3}
        onBack={() => nav('/kyc/processing')}
        title="Verify Details"
      />

      <div className="max-w-[480px] mx-auto px-4 py-5 space-y-4">

        {/* OCR extraction success banner */}
        <AnimatePresence>
          {showBanner && ocrResult && (
            <motion.div
              key="extraction-banner"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y:  0,  scale: 1    }}
              exit={{   opacity: 0, y: -12, scale: 0.97  }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              className="flex items-start gap-3 bg-primary/8 border border-primary/20 rounded-2xl px-4 py-4"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Sparkles size={15} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary-dark">
                  Information extracted successfully
                </p>
                <p className="text-xs text-text-gray mt-0.5 leading-relaxed">
                  Please review and confirm the details below match your document.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personal Information */}
        <SectionCard icon={User} title="Personal Information">
          <FormField
            label="Full Name"
            error={errors.full_name}
            autoFilled={autoFilled.has('full_name')}
          >
            <input
              type="text"
              value={formData.full_name}
              onChange={e => handle('full_name', e.target.value)}
              placeholder="As printed on your document"
              className={inputCls('full_name')}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Date of Birth"
              error={errors.dob}
              autoFilled={autoFilled.has('dob')}
            >
              <input
                type="date"
                value={formData.dob}
                onChange={e => handle('dob', e.target.value)}
                className={inputCls('dob')}
              />
            </FormField>

            <FormField label="Gender">
              <select
                value={formData.gender || ''}
                onChange={e => handle('gender', e.target.value)}
                className={selectCls}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </FormField>
          </div>
        </SectionCard>

        {/* Document Information */}
        <SectionCard icon={CreditCard} title="Document Information">
          <FormField
            label="ID / Citizenship Number"
            error={errors.id_number}
            autoFilled={autoFilled.has('id_number')}
          >
            <input
              type="text"
              value={formData.id_number}
              onChange={e => handle('id_number', e.target.value)}
              placeholder="e.g. 12-01-76-00012"
              className={inputCls('id_number')}
            />
          </FormField>

          <FormField
            label="Permanent Address"
            error={errors.address}
            autoFilled={autoFilled.has('address')}
          >
            <input
              type="text"
              value={formData.address}
              onChange={e => handle('address', e.target.value)}
              placeholder="e.g. Kathmandu, Bagmati Province"
              className={inputCls('address')}
            />
          </FormField>
        </SectionCard>

        {/* Contact Information — both fields optional */}
        <SectionCard icon={Phone} title="Contact Information">
          <FormField label="Phone Number" error={errors.phone} optional>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-text-gray shrink-0 h-[46px]">
                +977
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handle('phone', e.target.value)}
                placeholder="98XXXXXXXX"
                className={[
                  'flex-1 bg-white border-2 rounded-xl px-4 py-3 text-sm text-text-dark',
                  'placeholder:text-slate-400 outline-none transition-all duration-200',
                  'focus:ring-2 focus:ring-primary/15',
                  errors.phone
                    ? 'border-error bg-red-50/30 focus:border-error'
                    : 'border-slate-200 focus:border-primary hover:border-slate-300',
                ].join(' ')}
              />
            </div>
          </FormField>

          <FormField label="Email Address" error={errors.email} optional>
            <input
              type="email"
              value={formData.email}
              onChange={e => handle('email', e.target.value)}
              placeholder="you@example.com"
              className={inputCls('email')}
            />
          </FormField>
        </SectionCard>

        <Btn full size="lg" onClick={handleNext}>
          Review & Continue
          <ArrowRight size={16} strokeWidth={2.5} />
        </Btn>
      </div>
    </div>
  )
}
