import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'
import { useKYCStore } from '../store/kycStore.js'
import { submitKYC } from '../services/api.js'
import { Btn, StepHeader } from '../components/UI.jsx'

function validate(f) {
  const e = {}
  if (!f.full_name.trim())  e.full_name  = 'Please enter your full name'
  if (!f.dob)               e.dob        = 'Please enter a valid birth date'
  if (!f.id_number.trim())  e.id_number  = 'Please enter your ID number'
  if (!f.address.trim())    e.address    = 'Please enter your address'
  if (!f.phone.match(/^\+?[0-9]{10,15}$/))
                            e.phone      = 'Please enter a valid phone number'
  if (!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
                            e.email      = 'Please enter a valid email'
  const age = (Date.now() - new Date(f.dob)) / (1000 * 60 * 60 * 24 * 365)
  if (f.dob && (age < 16 || age > 120)) e.dob = 'Please enter a valid birth date'
  return e
}

const CONFIDENCE = { full_name: 99, dob: 97, id_number: 95, address: 82 }

function ConfBadge({ conf }) {
  const low = conf < 90
  return (
    <span className={[
      'text-[10px] font-bold px-2 py-0.5 rounded-full',
      low ? 'bg-amber-50 text-amber-600' : 'bg-primary/10 text-primary-dark',
    ].join(' ')}>
      {low ? '⚠' : '✓'} {conf}%
    </span>
  )
}

function FormField({ label, error, conf, showConf, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-text-dark">{label}</label>
        {showConf && conf && <ConfBadge conf={conf} />}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-error font-medium">
          <AlertTriangle size={11} />
          {error}
        </p>
      )}
    </div>
  )
}

export default function KYCForm() {
  const nav = useNavigate()
  const { formData, setFormData, ocrResult, setKycId, setKycStatus, docPreview, docPreviews } = useKYCStore()
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [step,    setStep]    = useState('form')
  const MOCK = import.meta.env.VITE_ENABLE_API !== 'true'

  function handle(field, val) {
    setFormData({ ...formData, [field]: val })
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n })
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

  const inputCls = (field, baseConf) => [
    'w-full bg-white border-2 rounded-xl px-4 py-3 text-sm text-text-dark',
    'placeholder:text-slate-400 outline-none transition-all',
    'focus:ring-2 focus:ring-primary/15',
    errors[field]
      ? 'border-error focus:border-error bg-red-50/30'
      : ocrResult && baseConf
      ? 'border-primary/30 focus:border-primary'
      : 'border-slate-200 focus:border-primary hover:border-slate-300',
  ].join(' ')

  if (step === 'done') return (
    <div className="page-root flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="max-w-sm w-full"
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #60BB46, #3A8A28)' }}
        >
          <CheckCircle2 size={48} color="#fff" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-black text-text-dark mb-3">KYC Submitted!</h2>
        <p className="text-sm text-text-gray mb-8 leading-relaxed">
          Your application is under review. Verification typically takes 1–3 business days. We'll notify you once complete.
        </p>
        <div className="flex gap-3">
          <Btn full onClick={() => nav('/kyc/tracking')} variant="primary">Track Status</Btn>
          <Btn full onClick={() => nav('/chat')} variant="outline">Ask AI</Btn>
        </div>
      </motion.div>
    </div>
  )

  if (step === 'review') return (
    <div className="page-root pb-8">
      <StepHeader
        steps={['Upload', 'Process', 'Details', 'Face ID', 'Submit']}
        current={3}
        onBack={() => setStep('form')}
        title="Review Details"
      />

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-4">

        <p className="text-sm text-text-gray font-medium">
          Compare your document with the extracted fields before proceeding.
        </p>

        {(docPreviews?.front || docPreview) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #60BB46, #3A8A28)' }}
                >
                  <ShieldCheck size={14} color="#fff" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-bold text-text-dark">Document Preview</p>
              </div>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#EBF7E6', color: '#3A8A28' }}
              >
                ✓ Verified
              </span>
            </div>

            <div className={[
              'grid gap-3 px-4 pb-4',
              docPreviews?.back ? 'grid-cols-2' : 'grid-cols-1',
            ].join(' ')}>
              {(docPreviews?.front || docPreview) && (
                <div className="space-y-1.5">
                  {docPreviews?.back && (
                    <p className="text-[10px] font-bold text-text-gray uppercase tracking-widest">Front</p>
                  )}
                  <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    <img
                      src={docPreviews?.front || docPreview}
                      alt="Document front"
                      className="w-full object-cover"
                      style={{ maxHeight: 160 }}
                    />
                  </div>
                </div>
              )}
              {docPreviews?.back && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-text-gray uppercase tracking-widest">Back</p>
                  <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    <img
                      src={docPreviews.back}
                      alt="Document back"
                      className="w-full object-cover"
                      style={{ maxHeight: 160 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: '#EFF6FF' }}
              >
                <Sparkles size={14} color="#3B82F6" strokeWidth={2.2} />
              </div>
              <p className="text-sm font-bold text-text-dark">Extracted Fields</p>
            </div>
            {ocrResult && (
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#EFF6FF', color: '#1D4ED8' }}
              >
                {Math.round((ocrResult.confidence || 0.9) * 100)}% confidence
              </span>
            )}
          </div>

          <div>
            {[
              ['Full Name',     formData.full_name,  CONFIDENCE.full_name],
              ['Date of Birth', formData.dob,         CONFIDENCE.dob],
              ['ID Number',     formData.id_number,   CONFIDENCE.id_number],
              ['Address',       formData.address,     CONFIDENCE.address],
              ['Phone',         formData.phone,       null],
              ['Email',         formData.email,       null],
            ].map(([label, value, conf], i, arr) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom: i < arr.length - 1 ? '1px solid #F9FAFB' : 'none',
                  background: i % 2 === 0 ? '#fff' : '#FAFAFA',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-text-gray shrink-0">{label}</span>
                  {conf && ocrResult && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{
                        background: conf >= 90 ? '#EBF7E6' : '#FFF7ED',
                        color: conf >= 90 ? '#3A8A28' : '#C2410C',
                      }}
                    >
                      {conf >= 90 ? '✓' : '⚠'} {conf}%
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-text-dark text-right max-w-[55%] truncate ml-3">
                  {value || '—'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14 }}
          className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
        >
          <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: '#D97706' }} />
          <p className="text-xs leading-relaxed font-medium" style={{ color: '#92400E' }}>
            Details look wrong? Tap{' '}
            <button
              onClick={() => setStep('form')}
              className="underline font-bold"
              style={{ color: '#D97706' }}
            >
              Edit Details
            </button>
            {' '}to correct them before proceeding.
          </p>
        </motion.div>

        <Btn full size="lg" onClick={() => nav('/kyc/face-verify')}>
          Confirm & Start Face Verification
          <ArrowRight size={16} strokeWidth={2.5} />
        </Btn>
      </div>
    </div>
  )

  return (
    <div className="page-root pb-8">
      <StepHeader
        steps={['Upload', 'Process', 'Details', 'Face ID', 'Submit']}
        current={3}
        onBack={() => nav('/kyc/processing')}
        title="Verify Details"
      />

      <div className="max-w-[480px] mx-auto px-4 py-5 space-y-5">

        {ocrResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3.5"
          >
            <Sparkles size={15} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-primary-dark">Fields auto-filled from your document</p>
              <p className="text-xs text-primary/70 mt-0.5">
                OCR confidence: {Math.round((ocrResult.confidence || 0.9) * 100)}% — review and correct if needed
              </p>
            </div>
          </motion.div>
        )}

        <div>
          <p className="text-[11px] font-bold text-text-gray uppercase tracking-widest mb-3">Personal Information</p>
          <div className="space-y-4">
            <FormField label="Full Name" error={errors.full_name} conf={CONFIDENCE.full_name} showConf={!!ocrResult}>
              <input
                type="text"
                value={formData.full_name}
                onChange={e => handle('full_name', e.target.value)}
                placeholder="As printed on document"
                className={inputCls('full_name', CONFIDENCE.full_name)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date of Birth" error={errors.dob} conf={CONFIDENCE.dob} showConf={!!ocrResult}>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={e => handle('dob', e.target.value)}
                  className={inputCls('dob', CONFIDENCE.dob)}
                />
              </FormField>

              <FormField label="Gender">
                <select
                  value={formData.gender || ''}
                  onChange={e => handle('gender', e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-text-dark outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-text-gray uppercase tracking-widest mb-3">Document Information</p>
          <div className="space-y-4">
            <FormField label="ID / Citizenship Number" error={errors.id_number} conf={CONFIDENCE.id_number} showConf={!!ocrResult}>
              <input
                type="text"
                value={formData.id_number}
                onChange={e => handle('id_number', e.target.value)}
                placeholder="e.g. 12-01-76-00012"
                className={inputCls('id_number', CONFIDENCE.id_number)}
              />
            </FormField>

            <FormField label="Permanent Address" error={errors.address} conf={CONFIDENCE.address} showConf={!!ocrResult}>
              <input
                type="text"
                value={formData.address}
                onChange={e => handle('address', e.target.value)}
                placeholder="e.g. Kathmandu, Bagmati Province"
                className={inputCls('address', CONFIDENCE.address)}
              />
              {CONFIDENCE.address < 90 && ocrResult && !errors.address && (
                <p className="flex items-center gap-1 text-[11px] text-amber-600 font-medium mt-0.5">
                  <AlertTriangle size={11} />
                  Low confidence — please verify this field
                </p>
              )}
            </FormField>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-text-gray uppercase tracking-widest mb-3">Contact Information</p>
          <div className="space-y-4">
            <FormField label="Phone Number" error={errors.phone}>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-text-gray shrink-0">
                  +977
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => handle('phone', e.target.value)}
                  placeholder="98XXXXXXXX"
                  className={[
                    'flex-1 bg-white border-2 rounded-xl px-4 py-3 text-sm text-text-dark',
                    'placeholder:text-slate-400 outline-none transition-all',
                    'focus:ring-2 focus:ring-primary/15',
                    errors.phone
                      ? 'border-error bg-red-50/30'
                      : 'border-slate-200 focus:border-primary hover:border-slate-300',
                  ].join(' ')}
                />
              </div>
            </FormField>

            <FormField label="Email Address" error={errors.email}>
              <input
                type="email"
                value={formData.email}
                onChange={e => handle('email', e.target.value)}
                placeholder="you@example.com"
                className={inputCls('email', null)}
              />
            </FormField>
          </div>
        </div>

        {ocrResult && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="18" fill="none" stroke="#F3F4F6" strokeWidth="5" />
                  <circle
                    cx="24" cy="24" r="18" fill="none"
                    stroke="#60BB46" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={113}
                    strokeDashoffset={113 - (113 * Math.round((ocrResult.confidence || 0.9) * 100) / 100)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-primary">
                    {Math.round((ocrResult.confidence || 0.9) * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-text-dark">OCR Confidence</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full mt-0.5">
                  <ShieldCheck size={10} strokeWidth={2.5} />
                  High Confidence
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[['Name', CONFIDENCE.full_name], ['DOB', CONFIDENCE.dob], ['ID Number', CONFIDENCE.id_number], ['Address', CONFIDENCE.address]].map(([lbl, conf]) => (
                <div key={lbl} className="flex items-center justify-between text-xs bg-slate-50 rounded-xl px-3 py-2">
                  <span className="text-text-gray font-medium">{lbl}</span>
                  <span className={conf >= 90 ? 'text-primary font-bold' : 'text-amber-600 font-bold'}>
                    {conf >= 90 ? '✓' : '⚠'} {conf}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Btn full size="lg" onClick={handleNext}>
          Review & Submit
          <ArrowRight size={16} strokeWidth={2.5} />
        </Btn>
      </div>
    </div>
  )
}
