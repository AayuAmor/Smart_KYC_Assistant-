import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Send, Bot, Sparkles, Clock,
  CheckCircle2, AlertCircle, ChevronRight,
} from 'lucide-react'
import { sendChatMessage } from '../services/api.js'
import { BottomNav } from '../components/UI.jsx'
import { useKYCStore } from '../store/kycStore.js'

const QUICK = [
  'Why was my KYC rejected?',
  'What documents are accepted?',
  'How long does verification take?',
  'My upload failed',
  'Can I use my passport?',
  'How do I resubmit?',
]

const MOCK_ANSWERS = {
  'Why was my KYC rejected?':
    'Your KYC was rejected because the uploaded document image was blurry and some text could not be read clearly. Please retake the photo in good lighting, ensuring all corners are visible and the image is sharp.',
  'What documents are accepted?':
    'Nepali citizens: Citizenship Card (front and back). Non-Resident Nepali: Valid Passport. Foreign nationals: Passport or Residence Permit. All documents must be valid and not expired.',
  'How long does verification take?':
    'Standard KYC verification takes 1 to 3 business days. You will receive a notification via email once your status changes.',
  'My upload failed':
    'This usually happens due to file size (max 10MB) or an unsupported format. Please use JPG or PNG. If the issue persists, try taking a new photo using the camera option.',
  'Can I use my passport?':
    'Yes. Nepali citizens can use a passport as an alternative to the citizenship card. Non-Resident Nepali and foreign nationals are required to submit a valid passport.',
  'How do I resubmit?':
    'Go to your KYC tracking page, tap "View Retry Options", then follow the tips for a better upload. Make sure the document is well-lit and all corners are captured.',
}

const statusConfig = {
  pending:      { label: 'Pending',      Icon: Clock,         color: '#9CA3AF', bg: '#F3F4F6'  },
  submitted:    { label: 'Submitted',    Icon: CheckCircle2,  color: '#3B82F6', bg: '#EFF6FF'  },
  under_review: { label: 'Under Review', Icon: Clock,         color: '#F59E0B', bg: '#FFF7ED'  },
  approved:     { label: 'Approved',     Icon: CheckCircle2,  color: '#22C55E', bg: '#F0FDF4'  },
  rejected:     { label: 'Rejected',     Icon: AlertCircle,   color: '#EF4444', bg: '#FEF2F2'  },
}

export default function ChatbotPage() {
  const nav = useNavigate()
  const { kycId, kycStatus, rejectionReason } = useKYCStore()
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m your KYC Assistant. Ask me anything about your verification, required documents, or rejection reasons.' },
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()
  const inputRef  = useRef()
  const MOCK = import.meta.env.VITE_ENABLE_API !== 'true'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(q) {
    const question = q || input.trim()
    if (!question) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: question }])
    setLoading(true)
    try {
      let answer
      if (MOCK) {
        await new Promise(r => setTimeout(r, 900))
        answer = MOCK_ANSWERS[question]
          || `For your question about "${question}" — please check your KYC tracking page for the latest update, or contact eSewa support with your KYC reference ID.`
      } else {
        const ctx = { kyc_id: kycId, status: kycStatus, rejection_reason: rejectionReason }
        const data = await sendChatMessage(question, ctx)
        answer = data.answer
      }
      setMessages(m => [...m, { role: 'bot', text: answer }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const st = statusConfig[kycStatus] || statusConfig.pending
  const StatusIcon = st.Icon

  return (
    <div className="page-root flex flex-col pb-20" style={{ height: '100dvh' }}>

      <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => nav('/dashboard')}
            className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-text-gray hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #60BB46, #3A8A28)' }}
          >
            <Bot size={18} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[14px] font-bold text-text-dark leading-tight">KYC AI Assistant</p>
            <p className="text-[10px] text-success font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full" />
              Online Now
            </p>
          </div>
        </div>
        <button
          onClick={() => nav('/kyc/tracking')}
          className="flex items-center gap-1 text-xs font-semibold text-text-gray hover:text-primary transition-colors"
        >
          View Status <ChevronRight size={13} />
        </button>
      </div>

      {kycId && (
        <div className="max-w-[480px] mx-auto w-full px-4 pt-3 shrink-0">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer hover:border-primary/30 transition-colors"
            style={{ background: st.bg, borderColor: `${st.color}30` }}
            onClick={() => nav('/kyc/tracking')}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${st.color}20` }}
            >
              <StatusIcon size={17} color={st.color} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold" style={{ color: st.color }}>KYC Status: {st.label}</p>
              <p className="text-[11px] font-mono text-text-gray truncate mt-0.5">{kycId}</p>
            </div>
            <ChevronRight size={14} style={{ color: st.color }} className="shrink-0 opacity-60" />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[480px] mx-auto px-4 py-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {(m.role === 'bot' || m.role === 'assistant') && (
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0 mb-0.5"
                    style={{ background: 'linear-gradient(135deg, #60BB46, #3A8A28)' }}
                  >
                    <Sparkles size={12} strokeWidth={2} />
                  </div>
                )}
                <div
                  className={[
                    'px-4 py-3 text-sm leading-relaxed max-w-[80%] shadow-sm',
                    m.role === 'bot' || m.role === 'assistant'
                      ? 'bg-white border border-slate-100 text-text-dark rounded-2xl rounded-bl-sm'
                      : 'text-white rounded-2xl rounded-br-sm',
                  ].join(' ')}
                  style={m.role === 'user'
                    ? { background: 'linear-gradient(135deg, #60BB46, #3A8A28)' }
                    : {}
                  }
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-end gap-2"
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #60BB46, #3A8A28)' }}
                >
                  <Sparkles size={12} color="#fff" strokeWidth={2} />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 shadow-sm">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      style={{ animation: `dots 1.4s ${i * 0.2}s ease-in-out infinite` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="bg-white border-t border-slate-100 shrink-0">
        <div className="px-4 pt-3 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {QUICK.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={loading}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-text-gray font-medium
                  hover:border-primary hover:text-primary hover:bg-primary/5 transition-all whitespace-nowrap
                  disabled:opacity-50 disabled:pointer-events-none"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-3 max-w-[480px] mx-auto w-full">
          <div className="flex gap-2 items-end">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && send()}
              placeholder="Ask anything about your KYC..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-text-dark
                placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15
                transition-all resize-none"
            />
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white
                disabled:opacity-40 transition-all shrink-0"
              style={{ background: 'linear-gradient(135deg, #60BB46, #3A8A28)' }}
            >
              <Send size={17} strokeWidth={2.2} />
            </motion.button>
          </div>
        </div>
      </div>

      <BottomNav active="chat" />
    </div>
  )
}
