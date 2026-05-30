import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Info,
} from 'lucide-react'
import { useKYCStore } from '../store/kycStore.js'
import { submitKYC } from '../services/api.js'
import { Btn, StepHeader } from '../components/UI.jsx'
import SearchableDropdown from '../components/SearchableDropdown.jsx'
import {
  PROVINCES, getDistricts, getMunicipalities, parseOCRAddress,
} from '../data/nepalAddress.js'

const OCCUPATIONS = [
  'Student', 'Software Engineer', 'Teacher', 'Doctor', 'Nurse',
  'Banker', 'Business Owner', 'Government Employee', 'Private Employee',
  'Freelancer', 'Farmer', 'Driver', 'Accountant', 'Lawyer',
  'Housewife', 'Retired', 'Self Employed', 'Engineer', 'Architect',
  'Police Officer', 'Army Personnel', 'Other',
]

function validate(f) {
  const e = {}

  if (!f.full_name.trim()) e.full_name = 'Full name is required'
  if (!f.dob) {
    e.dob = 'Date of birth is required'
  } else {
    const age = (Date.now() - new Date(f.dob)) / (1000 * 60 * 60 * 24 * 365)
    if (age < 16 || age > 120) e.dob = 'Enter a valid date of birth'
  }
  if (!f.id_number.trim()) e.id_number = 'Citizenship number is required'

  if (!f.permanent_province)     e.permanent_province     = 'Province is required'
  if (!f.permanent_district)     e.permanent_district     = 'District is required'
  if (!f.permanent_municipality) e.permanent_municipality = 'Municipality is required'
  if (!f.permanent_ward.trim())  e.permanent_ward         = 'Ward number is required'
  if (!f.permanent_tole.trim())  e.permanent_tole         = 'Tole / Street is required'

  if (!f.phone.trim()) {
    e.phone = 'Phone number is required'
  } else if (!f.phone.match(/^\+?[0-9]{10,15}$/)) {
    e.phone = 'Enter a valid phone number'
  }

  if (!f.occupation) e.occupation = 'Please select your occupation'

  if (f.email && !f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
    e.email = 'Enter a valid email address'
  if (f.pan && !/^\d{9}$/.test(f.pan.replace(/\s/g, '')))
    e.pan = 'PAN must be a 9-digit number'

  return e
}

function SectionTitle({ title }) {
  return (
    <div className="mb-5">
      <h3 className="text-[15px] font-semibold text-primary leading-snug tracking-wide">
        {title}
      </h3>
      <div className="mt-2 h-px bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-slate-100" />
}

function FormField({ label, error, optional = false, autoFilled = false, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-[13px] font-medium text-slate-700 leading-snug">
            {label}
          </label>
          {optional && (
            <span className="text-[11px] text-slate-400">(Optional)</span>
          )}
          <AnimatePresence>
            {autoFilled && (
              <motion.span
                key="af"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                <CheckCircle2 size={9} strokeWidth={2.5} /> Auto-filled
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 text-xs text-error font-medium"
          >
            <AlertTriangle size={11} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

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

  useEffect(() => {
    if (!ocrResult || ocrApplied.current) return
    ocrApplied.current = true

    const updates = {}
    const filled  = new Set()

    for (const [k, v] of Object.entries({
      full_name: ocrResult.full_name || ocrResult.name,
      dob:       ocrResult.dob,
      id_number: ocrResult.id_number,
    })) {
      if (v) { updates[k] = v; filled.add(k) }
    }

    if (ocrResult.address) {
      const p = parseOCRAddress(ocrResult.address)
      for (const [k, v] of Object.entries({
        permanent_province:     p.province,
        permanent_district:     p.district,
        permanent_municipality: p.municipality,
        permanent_ward:         p.ward,
        permanent_tole:         p.tole,
      })) {
        if (v) { updates[k] = v; filled.add(k) }
      }
    }

    if (Object.keys(updates).length) {
      setFormData({ ...formData, ...updates })
      setAutoFilled(filled)
      setShowBanner(true)
      setTimeout(() => setAutoFilled(new Set()), 4500)
    }
  }, [ocrResult])

  function handle(field, val) {
    const patch = { [field]: val }
    if (field === 'permanent_province') { patch.permanent_district = ''; patch.permanent_municipality = '' }
    if (field === 'permanent_district') { patch.permanent_municipality = '' }
    if (field === 'current_province')   { patch.current_district = ''; patch.current_municipality = '' }
    if (field === 'current_district')   { patch.current_municipality = '' }
    setFormData({ ...formData, ...patch })
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n })
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
      const permAddr = [
        formData.permanent_tole,
        formData.permanent_municipality,
        formData.permanent_ward ? `Ward ${formData.permanent_ward}` : '',
        formData.permanent_district,
        formData.permanent_province,
      ].filter(Boolean).join(', ')

      const payload = {
        ...formData,
        address: permAddr,
        ...(formData.current_same_as_permanent ? {
          current_province:     formData.permanent_province,
          current_district:     formData.permanent_district,
          current_municipality: formData.permanent_municipality,
          current_ward:         formData.permanent_ward,
          current_tole:         formData.permanent_tole,
        } : {}),
      }

      let data
      if (MOCK) {
        await new Promise(r => setTimeout(r, 1500))
        data = { kyc_id: 'KYC-' + Date.now(), status: 'submitted' }
        setKycId(data.kyc_id)
        setKycStatus('submitted')
        setStep('done')
      } else {
        data = await submitKYC(payload)
        setKycId(data.kyc_id)
        nav('/kyc/face-verify')
      }
    } finally { setLoading(false) }
  }

  const ic = (field) => [
    'w-full bg-white border rounded-xl px-4 py-3 text-sm text-text-dark',
    'placeholder:text-slate-400 outline-none transition-all duration-200',
    'focus:ring-2 focus:ring-primary/15',
    errors[field]
      ? 'border-error focus:border-error bg-red-50/30'
      : autoFilled.has(field)
      ? 'border-primary/50 bg-primary/[0.03] focus:border-primary autofill-pop'
      : 'border-slate-200 focus:border-primary hover:border-slate-300',
  ].join(' ')

  const sameAsPerm = formData.current_same_as_permanent

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

  if (step === 'review') {
    const permAddr = [
      formData.permanent_tole,
      formData.permanent_municipality,
      formData.permanent_ward && `Ward ${formData.permanent_ward}`,
      formData.permanent_district,
      formData.permanent_province,
    ].filter(Boolean).join(', ')

    const currAddr = sameAsPerm ? permAddr : [
      formData.current_tole,
      formData.current_municipality,
      formData.current_ward && `Ward ${formData.current_ward}`,
      formData.current_district,
      formData.current_province,
    ].filter(Boolean).join(', ')

    const rows = [
      ['Full Name',         formData.full_name],
      ['Date of Birth',     formData.dob],
      ['Gender',            formData.gender || '—'],
      ['Citizenship No.',   formData.id_number],
      ['Permanent Address', permAddr || '—'],
      ['Current Address',   sameAsPerm ? 'Same as Permanent' : (currAddr || '—')],
      ['Phone',             formData.phone || '—'],
      ['Email',             formData.email || '—'],
      ['Occupation',        formData.occupation || '—'],
      ['PAN',               formData.pan || '—'],
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
            Confirm everything is correct before face verification.
          </p>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_2px_12px_rgba(16,24,40,0.06)]">
            {rows.map(([label, value], i) => (
              <div
                key={label}
                className="flex justify-between items-start gap-4 px-5 py-3.5"
                style={{
                  borderBottom: i < rows.length - 1 ? '1px solid #F3F4F6' : 'none',
                  background: i % 2 ? '#FAFAFA' : '#fff',
                }}
              >
                <span className="text-xs font-semibold text-text-gray shrink-0">{label}</span>
                <span className="text-sm font-bold text-text-dark text-right break-words leading-snug max-w-[60%]">
                  {value || '—'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3.5">
            <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Ensure all details match your official document. Incorrect information may delay verification.
            </p>
          </div>

          <Btn full size="lg" loading={loading} onClick={handleSubmit}>
            Confirm & Start Face Verification
            <ArrowRight size={16} strokeWidth={2.5} />
          </Btn>
        </div>
      </div>
    )
  }

  return (
    <div className="page-root pb-8">
      <StepHeader
        steps={['Upload', 'Process', 'Details', 'Face ID', 'Submit']}
        current={3}
        onBack={() => nav('/kyc/processing')}
        title="Verify Details"
      />

      <div className="max-w-[480px] mx-auto px-4 py-5 space-y-4">

        <AnimatePresence>
          {showBanner && ocrResult && (
            <motion.div
              key="banner"
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,   scale: 1    }}
              exit={{   opacity: 0, y: -10, scale: 0.97  }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              className="flex items-start gap-3 bg-primary/8 border border-primary/20 rounded-2xl px-4 py-4"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Sparkles size={15} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary-dark">
                  Information extracted successfully
                </p>
                <p className="text-xs text-text-gray mt-0.5 leading-relaxed">
                  Please review and confirm the details below match your document.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(16,24,40,0.06)] border border-slate-100">

          <div className="px-5 pt-6 pb-5">
            <SectionTitle title="Personal Information" />
            <div className="space-y-4">

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
                  className={ic('full_name')}
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
                    className={ic('dob')}
                  />
                </FormField>

                <FormField label="Gender">
                  <select
                    value={formData.gender || ''}
                    onChange={e => handle('gender', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-text-dark outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15 hover:border-slate-300"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </FormField>
              </div>

              <FormField
                label="Citizenship Number"
                error={errors.id_number}
                autoFilled={autoFilled.has('id_number')}
              >
                <input
                  type="text"
                  value={formData.id_number}
                  onChange={e => handle('id_number', e.target.value)}
                  placeholder="e.g. 12-01-76-00012"
                  className={ic('id_number')}
                />
              </FormField>

            </div>
          </div>

          <Divider />

          <div className="px-5 pt-6 pb-5">
            <SectionTitle title="Permanent Address" />

            {showBanner && ocrResult?.address && (
              <div className="flex items-start gap-2.5 bg-primary/8 border border-primary/15 rounded-xl px-3.5 py-3 mb-4">
                <Info size={14} className="text-primary mt-0.5 shrink-0" />
                <p className="text-[11px] text-primary-dark leading-relaxed font-medium">
                  Address information was extracted automatically. Please verify the details below.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <SearchableDropdown
                label="Province"
                value={formData.permanent_province}
                options={PROVINCES}
                onChange={v => handle('permanent_province', v)}
                placeholder="Select Province"
                searchPlaceholder="Search province..."
                error={errors.permanent_province}
                autoFilled={autoFilled.has('permanent_province')}
              />

              <SearchableDropdown
                label="District"
                value={formData.permanent_district}
                options={getDistricts(formData.permanent_province)}
                onChange={v => handle('permanent_district', v)}
                placeholder={formData.permanent_province ? 'Select District' : 'Select a province first'}
                searchPlaceholder="Search district..."
                error={errors.permanent_district}
                disabled={!formData.permanent_province}
                autoFilled={autoFilled.has('permanent_district')}
              />

              <SearchableDropdown
                label="Municipality / Rural Municipality"
                value={formData.permanent_municipality}
                options={getMunicipalities(formData.permanent_district)}
                onChange={v => handle('permanent_municipality', v)}
                placeholder={formData.permanent_district ? 'Select Municipality' : 'Select a district first'}
                searchPlaceholder="Search municipality..."
                error={errors.permanent_municipality}
                disabled={!formData.permanent_district}
                autoFilled={autoFilled.has('permanent_municipality')}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Ward No"
                  error={errors.permanent_ward}
                  autoFilled={autoFilled.has('permanent_ward')}
                >
                  <input
                    type="number"
                    min="1"
                    max="35"
                    value={formData.permanent_ward}
                    onChange={e => handle('permanent_ward', e.target.value)}
                    placeholder="e.g. 10"
                    className={ic('permanent_ward')}
                  />
                </FormField>

                <FormField
                  label="Tole / Street"
                  error={errors.permanent_tole}
                  autoFilled={autoFilled.has('permanent_tole')}
                >
                  <input
                    type="text"
                    value={formData.permanent_tole}
                    onChange={e => handle('permanent_tole', e.target.value)}
                    placeholder="e.g. Baneswor"
                    className={ic('permanent_tole')}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <Divider />

          <div className="px-5 pt-6 pb-5">
            <SectionTitle title="Current Address" />

            <label className="flex items-center gap-3 cursor-pointer select-none mb-4">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={sameAsPerm}
                  onChange={e => handle('current_same_as_permanent', e.target.checked)}
                  className="sr-only"
                />
                <div className={[
                  'w-10 h-6 rounded-full transition-colors duration-200',
                  sameAsPerm ? 'bg-primary' : 'bg-slate-200',
                ].join(' ')} />
                <motion.div
                  animate={{ x: sameAsPerm ? 18 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </div>
              <span className="text-sm font-medium text-text-dark">
                Same as Permanent Address
              </span>
            </label>

            <AnimatePresence mode="wait">
              {sameAsPerm ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                >
                  {formData.permanent_province ? (
                    <p className="text-sm text-text-gray leading-relaxed">
                      {[
                        formData.permanent_tole,
                        formData.permanent_municipality,
                        formData.permanent_ward && `Ward ${formData.permanent_ward}`,
                        formData.permanent_district,
                        formData.permanent_province,
                      ].filter(Boolean).join(', ') || 'Fill in permanent address above'}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      Fill in permanent address first
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="fields"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <SearchableDropdown
                    label="Province"
                    value={formData.current_province}
                    options={PROVINCES}
                    onChange={v => handle('current_province', v)}
                    placeholder="Select Province"
                    searchPlaceholder="Search province..."
                  />
                  <SearchableDropdown
                    label="District"
                    value={formData.current_district}
                    options={getDistricts(formData.current_province)}
                    onChange={v => handle('current_district', v)}
                    placeholder={formData.current_province ? 'Select District' : 'Select a province first'}
                    searchPlaceholder="Search district..."
                    disabled={!formData.current_province}
                  />
                  <SearchableDropdown
                    label="Municipality / Rural Municipality"
                    value={formData.current_municipality}
                    options={getMunicipalities(formData.current_district)}
                    onChange={v => handle('current_municipality', v)}
                    placeholder={formData.current_district ? 'Select Municipality' : 'Select a district first'}
                    searchPlaceholder="Search municipality..."
                    disabled={!formData.current_district}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Ward No">
                      <input
                        type="number"
                        min="1"
                        max="35"
                        value={formData.current_ward}
                        onChange={e => handle('current_ward', e.target.value)}
                        placeholder="e.g. 5"
                        className={ic('current_ward')}
                      />
                    </FormField>
                    <FormField label="Tole / Street">
                      <input
                        type="text"
                        value={formData.current_tole}
                        onChange={e => handle('current_tole', e.target.value)}
                        placeholder="e.g. Thamel"
                        className={ic('current_tole')}
                      />
                    </FormField>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Divider />

          <div className="px-5 pt-6 pb-5">
            <SectionTitle title="Contact Information" />
            <div className="space-y-4">

              <FormField label="Phone Number" error={errors.phone}>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-text-gray shrink-0 h-[46px]">
                    +977
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => handle('phone', e.target.value)}
                    placeholder="98XXXXXXXX"
                    className={[
                      'flex-1 bg-white border rounded-xl px-4 py-3 text-sm text-text-dark',
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
                  className={ic('email')}
                />
              </FormField>

            </div>
          </div>

          <Divider />

          <div className="px-5 pt-6 pb-6">
            <SectionTitle title="Other Information" />
            <div className="space-y-4">

              <SearchableDropdown
                label="Occupation"
                value={formData.occupation}
                options={OCCUPATIONS}
                onChange={v => handle('occupation', v)}
                placeholder="Search or select occupation"
                searchPlaceholder="e.g. Teacher, Engineer..."
                error={errors.occupation}
              />

              <FormField label="PAN Number" error={errors.pan} optional>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={e => handle('pan', e.target.value)}
                  placeholder="9-digit PAN number"
                  maxLength={9}
                  className={ic('pan')}
                />
              </FormField>

            </div>
          </div>

        </div>

        <Btn full size="lg" onClick={handleNext} loading={loading}>
          Review & Continue
          <ArrowRight size={16} strokeWidth={2.5} />
        </Btn>

      </div>
    </div>
  )
}
