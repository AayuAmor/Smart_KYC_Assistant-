import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bell, Shield, Upload, MessageSquare, History,
  ChevronRight, CheckCircle2, Clock, ArrowRight, Sparkles,
  FileText, ShieldCheck, Zap,
} from 'lucide-react'
import { useKYCStore } from '../store/kycStore.js'
import { BottomNav, Sidebar, SectionLabel } from '../components/UI.jsx'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const quickActions = [
  { icon: MessageSquare, label: 'AI Assistant',   sub: 'Get instant help',        href: '/chat',          bg: '#EFF6FF', color: '#3B82F6' },
  { icon: FileText,      label: 'Auto Fill Data', sub: 'View extracted details',  href: '/kyc/form',      bg: '#F0FDF4', color: '#22C55E' },
  { icon: Upload,        label: 'Documents',      sub: 'View uploaded docs',      href: '/kyc/upload',    bg: '#FFF7ED', color: '#F59E0B' },
  { icon: History,       label: 'History',        sub: 'KYC submission history',  href: '/kyc/tracking',  bg: '#F5F3FF', color: '#8B5CF6' },
]

const statusMap = {
  pending:      { label: 'Pending',      badgeBg: '#FFF7ED', badgeText: '#C2410C', pct: 20, desc: 'Upload your documents to begin identity verification.' },
  submitted:    { label: 'Submitted',    badgeBg: '#EFF6FF', badgeText: '#1D4ED8', pct: 50, desc: 'Application received. Processing will begin shortly.' },
  under_review: { label: 'Under Review', badgeBg: '#FFF7ED', badgeText: '#C2410C', pct: 70, desc: 'Our team is verifying your documents. Hang tight!' },
  approved:     { label: 'Approved',     badgeBg: '#EBF7E6', badgeText: '#3A8A28', pct: 100, desc: 'Your KYC is fully verified. You\'re all set!' },
  rejected:     { label: 'Rejected',     badgeBg: '#FEF2F2', badgeText: '#B91C1C', pct: 30, desc: 'Verification failed. Please re-upload a clear document.' },
}

function KYCIllustration() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 110, height: 90 }}>
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 72, height: 50,
        background: '#E9F7E3', border: '1.5px solid #B8E5A8',
        borderRadius: 10, transform: 'rotate(6deg)',
      }} />
      <div style={{
        position: 'absolute', bottom: 8, right: 4,
        width: 72, height: 50,
        background: '#fff', border: '1.5px solid #D1E8C8',
        borderRadius: 10, transform: 'rotate(2deg)',
        display: 'flex', flexDirection: 'column',
        padding: '7px 9px', gap: 4,
      }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#60BB46', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 4, background: '#E5E7EB', borderRadius: 999, marginBottom: 3 }} />
            <div style={{ height: 3, background: '#F3F4F6', borderRadius: 999, width: '70%' }} />
          </div>
        </div>
        <div style={{ height: 3, background: '#F3F4F6', borderRadius: 999 }} />
        <div style={{ height: 3, background: '#F3F4F6', borderRadius: 999, width: '80%' }} />
      </div>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 34, height: 34,
        background: 'linear-gradient(135deg, #60BB46, #3A8A28)',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(96,187,70,0.40)',
      }}>
        <ShieldCheck size={16} color="#fff" strokeWidth={2.5} />
      </div>
      <div style={{
        position: 'absolute', bottom: 2, left: 18,
        width: 20, height: 20,
        background: '#fff',
        border: '2px solid #60BB46',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CheckCircle2 size={11} color="#60BB46" strokeWidth={2.5} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()
  const { user, kycStatus } = useKYCStore()

  const recentActivity = [
    kycStatus !== 'pending' && {
      icon: CheckCircle2,
      label: 'KYC application submitted',
      time: 'Recently',
      iconColor: '#60BB46',
      bg: '#EBF7E6',
    },
    kycStatus === 'under_review' && {
      icon: Clock,
      label: 'KYC verification in progress',
      time: 'Recently',
      iconColor: '#F59E0B',
      bg: '#FFF7ED',
    },
    kycStatus === 'approved' && {
      icon: CheckCircle2,
      label: 'KYC approved — identity verified',
      time: 'Recently',
      iconColor: '#22C55E',
      bg: '#F0FDF4',
    },
    kycStatus === 'rejected' && {
      icon: Sparkles,
      label: 'KYC rejected — action required',
      time: 'Recently',
      iconColor: '#EF4444',
      bg: '#FEF2F2',
    },
  ].filter(Boolean)

  const stageOrder = ['submitted', 'under_review', 'approved']
  const currentStage = stageOrder.indexOf(kycStatus)
  const verificationTimeline = [
    { label: 'Documents Submitted', done: currentStage >= 0, active: currentStage === 0 },
    { label: 'Identity Verified',   done: currentStage >= 1, active: currentStage === 1 },
    { label: 'Under Review',        done: currentStage >= 2, active: currentStage === 2 },
    { label: 'KYC Approved',        done: currentStage >= 3, active: currentStage === 3 },
  ]

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const st = statusMap[kycStatus] || statusMap.pending

  return (
    <div className="page-root pb-24 with-sidebar">
      <Sidebar active="dashboard" />

      <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <span className="text-[15px] font-black text-primary tracking-tight block">Smart KYC</span>
            <span className="text-[10px] font-semibold text-text-gray tracking-wide">Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-text-gray hover:bg-slate-100 transition-colors relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
          </button>
          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm font-black text-primary cursor-pointer">
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-4">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-5 rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #f0fae8 0%, #e8f7df 100%)', border: '1.5px solid #c8e8b8' }}
        >
          <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary/80 mb-1">
                {greet}, {user.name || 'there'}! 👋
              </p>
              <h2 className="text-xl font-black text-text-dark leading-tight mb-2">
                Complete your KYC<br />Verification
              </h2>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['AI-Powered', 'Fast', 'Secure', 'Reliable'].map((tag, i) => (
                  <span key={tag}>
                    <span className="text-[11px] font-semibold text-primary-dark">{tag}</span>
                    {i < 3 && <span className="text-primary/40 text-[11px] ml-1.5">•</span>}
                  </span>
                ))}
              </div>
            </div>
            <KYCIllustration />
          </div>

          <div className="mx-4 mb-4 p-4 bg-white rounded-2xl border border-white/80 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Upload className="h-5 w-5 text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-dark">Upload Citizenship or Passport</p>
                <p className="text-xs text-text-gray">Drag & drop your document here</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => nav('/kyc/upload')}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #60BB46 0%, #3A8A28 100%)', boxShadow: '0 3px 12px rgba(96,187,70,0.30)' }}
            >
              Upload Document
            </motion.button>
            <p className="text-center text-[10px] text-text-gray mt-2">Supported: JPG, PNG, PDF (Max 10MB)</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(16,24,40,0.04)] p-5"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-text-gray uppercase tracking-widest mb-2">KYC Status</p>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: st.badgeBg, color: st.badgeText }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.badgeText }} />
                {st.label}
              </span>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="#F3F4F6" strokeWidth="5" />
                <motion.circle
                  cx="28" cy="28" r="22" fill="none"
                  stroke="#60BB46" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={138}
                  initial={{ strokeDashoffset: 138 }}
                  animate={{ strokeDashoffset: 138 - (138 * st.pct / 100) }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black text-primary">{st.pct}%</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-text-gray leading-relaxed mb-4">{st.desc}</p>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => nav('/kyc/tracking')}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #60BB46 0%, #3A8A28 100%)' }}
            >
              View Details
            </motion.button>
            <button
              onClick={() => nav('/chat')}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-text-gray bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              Get Help
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="mt-5"
        >
          <SectionLabel>Quick Actions</SectionLabel>
          <div className="grid grid-cols-4 gap-2.5">
            {quickActions.map((a) => (
              <motion.button
                key={a.label}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => nav(a.href)}
                className="flex flex-col items-center p-3 wallet-card text-center cursor-pointer transition-all hover:shadow-wallet"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: a.bg }}
                >
                  <a.icon size={18} color={a.color} strokeWidth={2} />
                </div>
                <p className="text-[10px] font-bold text-text-dark leading-tight">{a.label}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.22 }}
          className="mt-5"
        >
          <SectionLabel action="View All" onAction={() => nav('/kyc/tracking')}>Verification Progress</SectionLabel>
          <div className="wallet-card rounded-2xl p-4">
            {verificationTimeline.map((step, i) => (
              <div key={step.label} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className={[
                    'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                    step.done
                      ? 'green-gradient shadow-sm'
                      : step.active
                      ? 'bg-amber-50 border-2 border-amber-400'
                      : 'bg-slate-50 border border-slate-200',
                  ].join(' ')}>
                    {step.done
                      ? <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} />
                      : step.active
                      ? <Clock size={12} color="#F59E0B" strokeWidth={2.5} />
                      : <div className="w-2 h-2 rounded-full bg-slate-300" />
                    }
                  </div>
                  {i < verificationTimeline.length - 1 && (
                    <div className={['w-0.5 my-1 rounded-full', step.done ? 'bg-primary h-6' : 'bg-slate-200 h-6'].join(' ')} />
                  )}
                </div>
                <div className={['pt-1', i < verificationTimeline.length - 1 ? 'pb-0' : ''].join(' ')}>
                  <p className={[
                    'text-[13px] font-semibold',
                    step.done ? 'text-text-dark' : step.active ? 'text-amber-700' : 'text-slate-400',
                  ].join(' ')}>
                    {step.label}
                  </p>
                  <p className={['text-[11px] font-medium mt-0.5', step.done ? 'text-primary' : step.active ? 'text-amber-500' : ''].join(' ')}>
                    {step.done ? 'Completed' : step.active ? 'In progress...' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.30 }}
          className="mt-5"
        >
          <SectionLabel>Recent Activity</SectionLabel>
          <div className="wallet-card rounded-2xl overflow-hidden">
            {recentActivity.map((a, i) => (
              <motion.div
                key={i}
                whileHover={{ backgroundColor: '#FAFAFA' }}
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors"
                style={{ borderBottom: i < recentActivity.length - 1 ? '1px solid #F3F4F6' : 'none' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: a.bg }}>
                  <a.icon size={16} color={a.iconColor} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-text-dark truncate">{a.label}</p>
                  <p className="text-[11px] text-text-gray mt-0.5 font-medium">{a.time}</p>
                </div>
                <ChevronRight size={13} className="text-slate-300 shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.38 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => nav('/chat')}
          className="mt-5 rounded-[1.5rem] p-5 cursor-pointer relative overflow-hidden wallet-card"
        >
          <div style={{
            position: 'absolute', top: -20, right: -20, width: 100, height: 100,
            background: 'radial-gradient(circle, rgba(96,187,70,0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #60BB46, #3A8A28)', boxShadow: '0 8px 18px rgba(96,187,70,0.18)' }}
            >
              <Sparkles size={22} color="#fff" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-text-dark mb-1">AI KYC Assistant</p>
              <p className="text-xs text-text-gray leading-relaxed">Get instant answers about your verification</p>
            </div>
            <ArrowRight size={18} className="text-slate-400 shrink-0" />
          </div>
        </motion.div>

        <div className="mt-5 mb-2 flex items-center justify-center gap-2 py-3.5 px-4 bg-primary/5 rounded-2xl border border-primary/10">
          <Shield size={14} className="text-primary shrink-0" />
          <p className="text-xs font-semibold text-primary-dark">Your data is 100% secure and encrypted</p>
        </div>

        <div className="flex items-center justify-center gap-5 mb-2 pb-1">
          {[
            { icon: <Zap size={10} />, text: '256-bit SSL' },
            { icon: '🛡️', text: 'RBI Compliant' },
            { icon: '✅', text: 'ISO 27001' },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <span>{icon}</span> {text}
            </span>
          ))}
        </div>
      </div>

      <BottomNav active="dashboard" />
    </div>
  )
}
