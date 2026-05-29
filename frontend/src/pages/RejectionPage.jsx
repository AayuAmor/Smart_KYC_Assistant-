import { useNavigate } from 'react-router-dom'
import { useKYCStore } from '../store/kycStore.js'
import { TopBar, Btn } from '../components/UI.jsx'

const TIPS = [
  'Use proper lighting — avoid dim environments',
  'Avoid shadows on the document',
  'Capture all four corners clearly',
  'Hold the camera steady to avoid blur',
  'Remove any plastic cover or sleeve',
]

export default function RejectionPage() {
  const nav = useNavigate()
  const { rejectionReason, reset } = useKYCStore()

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <TopBar title="Verification Failed" back={() => nav('/kyc/tracking')} />

      <div className="max-w-[480px] mx-auto px-4 py-6 space-y-5 fade-up">
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">❌</div>
          <h2 className="text-xl font-bold text-[var(--text)]">We couldn't verify your document.</h2>
          <p className="text-sm text-[var(--text2)] mt-2">Don't worry — this is easy to fix.</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <p className="text-xs font-bold text-red-500 mb-1 uppercase tracking-wide">Rejection Reason</p>
          <p className="text-sm font-semibold text-red-700">
            {rejectionReason || 'The uploaded image was blurry and some text could not be verified.'}
          </p>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-2xl p-5 space-y-3">
          <p className="text-sm font-bold text-[var(--text)]">Tips for a Better Upload</p>
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-[var(--text2)]">
              <span className="text-[var(--green)] font-bold mt-0.5 shrink-0">✓</span>
              {tip}
            </div>
          ))}
        </div>

        <Btn full size="lg" onClick={() => { reset(); nav('/kyc/upload') }}>
          📷  Retake Photo
        </Btn>

        <Btn full variant="outline" onClick={() => nav('/chat')}>
          Ask AI for Help
        </Btn>
      </div>
    </div>
  )
}
