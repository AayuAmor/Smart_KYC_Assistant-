import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getKYCStatus } from '../services/api.js'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Clock, Search, ShieldCheck, Upload,
  MessageSquare, AlertCircle, ArrowRight,
} from 'lucide-react'
import { useKYCStore } from '../store/kycStore.js'
import { AppHeader, BottomNav } from '../components/UI.jsx'

const TIMELINE = [
  { key: 'uploaded',  label: 'Document Uploaded',    desc: 'Your document has been received.',               Icon: Upload,       color: '#60BB46', bg: '#EBF7E6' },
  { key: 'ocr',       label: 'OCR Completed',         desc: 'AI extracted your details successfully.',         Icon: Search,       color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'started',   label: 'Under Review',          desc: 'Our team is reviewing your application.',        Icon: Clock,        color: '#F59E0B', bg: '#FFF7ED' },
  { key: 'review',    label: 'Verification',          desc: 'Detailed verification in progress.',              Icon: ShieldCheck,  color: '#8B5CF6', bg: '#F5F3FF' },
  { key: 'approved',  label: 'Approved',              desc: 'KYC fully verified — you\'re all set!',           Icon: CheckCircle2, color: '#22C55E', bg: '#F0FDF4' },
]

const STATUS_STAGE = { submitted: 1, under_review: 2, approved: 4, rejected: -1, pending: 0 }

const statusMap = {
  pending:      { label: 'Pending',      pct: 0,   color: '#9CA3AF', badgeBg: '#F3F4F6',  badgeText: '#6B7280' },
  submitted:    { label: 'Submitted',    pct: 30,  color: '#3B82F6', badgeBg: '#EFF6FF',  badgeText: '#1D4ED8' },
  under_review: { label: 'Under Review', pct: 60,  color: '#F59E0B', badgeBg: '#FFF7ED',  badgeText: '#C2410C' },
  approved:     { label: 'Approved',     pct: 100, color: '#22C55E', badgeBg: '#EBF7E6',  badgeText: '#3A8A28' },
  rejected:     { label: 'Rejected',     pct: 30,  color: '#EF4444', badgeBg: '#FEF2F2',  badgeText: '#B91C1C' },
}

export default function KYCTracking() {
  const nav = useNavigate()
  const { kycId, kycStatus, rejectionReason, setKycStatus } = useKYCStore()

  const MOCK = import.meta.env.VITE_ENABLE_API !== 'true'

  useEffect(() => {
    if (MOCK || !kycId) return
    const poll = setInterval(async () => {
      try {
        const result = await getKYCStatus(kycId)
        setKycStatus(result.status, result.rejection_reason)
        if (result.status === 'approved' || result.status === 'rejected') {
          clearInterval(poll)
          if (result.status === 'rejected') nav('/kyc/rejected')
        }
      } catch {
        clearInterval(poll)
      }
    }, 4000)
    return () => clearInterval(poll)
  }, [kycId, MOCK])
  const stageIdx = STATUS_STAGE[kycStatus] ?? 0
  const st = statusMap[kycStatus] || statusMap.pending

  return (
    <div className="page-root pb-24">
      <AppHeader
        title="KYC Status"
        back={() => nav('/dashboard')}
        right={
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: st.badgeBg, color: st.badgeText }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.badgeText }} />
            {st.label}
          </span>
        }
      />

      <div className="max-w-[480px] mx-auto px-4 py-5 space-y-4">

        {kycId && (
          <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
            <span className="text-xs font-semibold text-text-gray">Reference ID</span>
            <span className="text-xs font-mono font-bold text-text-dark tracking-wide">{kycId}</span>
          </div>
        )}

        {kycStatus !== 'rejected' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
          >
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#F3F4F6" strokeWidth="7" />
                  <motion.circle
                    cx="36" cy="36" r="28" fill="none"
                    stroke={st.color} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={176}
                    initial={{ strokeDashoffset: 176 }}
                    animate={{ strokeDashoffset: 176 - (176 * st.pct / 100) }}
                    transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black" style={{ color: st.color }}>{st.pct}%</span>
                  <span className="text-[9px] font-semibold text-text-gray">Done</span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-base font-black text-text-dark mb-1">
                  {kycStatus === 'approved' ? 'KYC Approved!' : 'Under Review'}
                </h3>
                <p className="text-xs text-text-gray leading-relaxed mb-3">
                  {kycStatus === 'approved'
                    ? 'Your identity has been fully verified.'
                    : 'Your KYC is being verified. We\'ll notify you once complete.'}
                </p>
                {kycStatus !== 'approved' && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-gray">
                    <Clock size={12} className="text-amber-500" />
                    Estimated: 10–15 min
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${st.color}, ${st.color}cc)` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${st.pct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {kycStatus === 'rejected' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-error" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="font-bold text-red-800 text-sm">Verification Failed</h3>
                <p className="text-xs text-red-600 mt-0.5">Action required to complete KYC</p>
              </div>
            </div>
            <p className="text-sm text-red-700 leading-relaxed">
              {rejectionReason || 'The uploaded image was blurry or details could not be read clearly. Please upload a clearer image.'}
            </p>
            <button
              onClick={() => nav('/kyc/rejected')}
              className="w-full bg-error text-white font-semibold py-3 rounded-xl text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              View Retry Options
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-text-dark mb-5">Verification Steps</h3>
          <div>
            {TIMELINE.map((item, i) => {
              const isDone    = i <= stageIdx
              const isActive  = i === stageIdx + 1
              const isPending = i >  stageIdx + 1

              return (
                <div key={item.key} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                      style={{
                        background: isDone ? item.bg : isActive ? '#FFFBEB' : '#F9FAFB',
                        border: isDone ? 'none' : isActive ? '2px solid #F59E0B' : '1.5px solid #E5E7EB',
                        boxShadow: isDone ? `0 2px 8px ${item.color}25` : 'none',
                      }}
                    >
                      {isDone
                        ? <CheckCircle2 size={18} color={item.color} strokeWidth={2.5} />
                        : isActive
                        ? <Clock size={16} color="#F59E0B" strokeWidth={2.2} />
                        : <item.Icon size={16} color="#D1D5DB" strokeWidth={1.8} />
                      }
                    </motion.div>
                    {i < TIMELINE.length - 1 && (
                      <div
                        className="w-0.5 rounded-full my-1"
                        style={{
                          height: 28,
                          background: isDone
                            ? `linear-gradient(to bottom, ${item.color}, ${item.color}60)`
                            : '#E5E7EB',
                        }}
                      />
                    )}
                  </div>

                  <div className={['flex-1', i < TIMELINE.length - 1 ? 'pb-1' : ''].join(' ')}>
                    <div className="pt-2 pb-5">
                      <p className={[
                        'text-sm font-bold leading-tight',
                        isDone ? 'text-text-dark' : isActive ? 'text-amber-700' : 'text-slate-400',
                      ].join(' ')}>
                        {item.label}
                        {isActive && (
                          <span className="ml-2 text-[10px] font-semibold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            In progress
                          </span>
                        )}
                      </p>
                      {isDone && (
                        <p className="text-xs text-text-gray mt-0.5 leading-relaxed">{item.desc}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {kycStatus !== 'approved' && kycStatus !== 'rejected' && (
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3.5">
            <Clock size={16} className="text-primary shrink-0" />
            <div>
              <p className="text-xs font-bold text-primary-dark">Estimated completion</p>
              <p className="text-xs text-primary/70 mt-0.5">We will notify you once your KYC is verified</p>
            </div>
            <span className="ml-auto text-sm font-black text-primary shrink-0">10–15 min</span>
          </div>
        )}

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => nav('/chat')}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 flex items-center gap-3 px-4 hover:border-primary/30 hover:bg-primary/5 transition-all"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #60BB46, #3A8A28)' }}>
            <MessageSquare size={17} color="#fff" strokeWidth={2} />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-bold text-text-dark">Ask AI Assistant</p>
            <p className="text-xs text-text-gray">Get answers about your KYC status</p>
          </div>
          <ArrowRight size={15} className="text-slate-400 shrink-0" />
        </motion.button>
      </div>

      <BottomNav active="tracking" />
    </div>
  )
}
