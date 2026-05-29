import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/UI.jsx'

const features = [
  { icon: '📄', title: 'Document Autofill', desc: 'Upload your citizenship or passport — OCR reads and fills the form automatically.' },
  { icon: '✅', title: 'Smart Validation',  desc: 'Real-time field checks catch errors before you submit, not after rejection.' },
  { icon: '📊', title: 'Live KYC Status',   desc: 'Step-by-step tracker with plain-language status labels at every stage.' },
  { icon: '🤖', title: 'AI KYC Chatbot',    desc: 'Ask why you were rejected or what document you need. Instant answers, no support queue.' },
]

export default function LandingPage() {
  const nav = useNavigate()
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-32 pb-20 text-center">
        <div className="fade-up stagger">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--mint)] text-[var(--mint)] text-xs font-semibold mb-6"
            style={{ background: 'var(--mint-dim)' }}>
            eSewa Hackathon 2026 · Challenge 4
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            KYC that works<br />
            <span style={{ color: 'var(--mint)' }}>for the user</span>
          </h1>

          <p className="text-base mb-8" style={{ color: 'var(--muted)', maxWidth: 500, margin: '0 auto 2rem' }}>
            Smart form assistance, OCR autofill, live progress tracking,
            and an AI chatbot that answers your KYC questions instantly.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => nav('/kyc')}
              className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95"
              style={{ background: 'var(--mint)', color: 'var(--bg)' }}>
              Start KYC Verification
            </button>
            <button onClick={() => nav('/status')}
              className="px-6 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-[var(--mint-dim)]"
              style={{ borderColor: 'var(--border)', color: 'var(--lgray)' }}>
              Check My Status
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-3 gap-4">
          {[['40%','first-attempt failure rate'],['3×','more support tickets'],['68%','users abandon complex forms']].map(([n,l]) => (
            <div key={n} className="p-5 rounded-2xl border text-center"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="text-3xl font-black mb-1" style={{ color: 'var(--mint)' }}>{n}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <h2 className="text-xl font-bold mb-8 text-center">Four features, one smooth journey</h2>
        <div className="grid sm:grid-cols-2 gap-4 stagger">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="fade-up p-5 rounded-2xl border transition-all hover:border-[var(--mint)]"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-3">{icon}</div>
              <div className="text-sm font-bold mb-1">{title}</div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
