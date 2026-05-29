import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Lock } from 'lucide-react'

export default function SplashScreen() {
  const nav = useNavigate()
  useEffect(() => { const t = setTimeout(() => nav('/dashboard'), 2600); return () => clearTimeout(t) }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #60BB46 0%, #4e9b39 55%, #3A8A28 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 480, height: 480,
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 340, height: 340,
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 220, height: 220,
          border: '1px solid rgba(255,255,255,0.13)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center px-8 relative z-10"
      >
        <div
          className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-7 shadow-2xl"
          style={{ animation: 'pulse-g 2.4s ease-in-out infinite' }}
        >
          <ShieldCheck className="w-12 h-12 text-primary" strokeWidth={2} />
        </div>

        <h1 className="text-4xl font-black text-white mb-1.5 tracking-tight">Smart KYC</h1>
        <p className="text-base text-white/80 font-semibold mb-1">Assistant</p>
        <p className="text-sm text-white/65 font-medium mt-3">AI-Powered Identity Verification</p>

        <div className="flex items-center justify-center gap-3 mt-6">
          {[
            { icon: <Zap size={11} />, label: 'Fast' },
            { icon: <ShieldCheck size={11} />, label: 'Secure' },
            { icon: <Lock size={11} />, label: 'Reliable' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              <span className="text-white/90">{icon}</span>
              <span className="text-white/90 text-xs font-semibold">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-12">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-white/50 rounded-full"
              style={{ animation: `dots 1.4s ${i * 0.22}s ease-in-out infinite` }}
            />
          ))}
        </div>
      </motion.div>

      <p className="absolute bottom-8 text-white/40 text-xs font-medium tracking-wide">
        Powered by eSewa · Hackathon 2026
      </p>
    </div>
  )
}
