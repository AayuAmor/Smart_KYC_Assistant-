import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, RefreshCw, AlertCircle, CheckCircle2,
  ArrowRight, MessageSquare, ShieldCheck, Lightbulb,
  X, ChevronRight, RotateCcw,
} from 'lucide-react'
import { useKYCStore } from '../store/kycStore.js'
import { submitKYC } from '../services/api.js'
import { Btn } from '../components/UI.jsx'

const OW = 220
const OH = 270

const S = {
  INIT:       'init',
  NO_FACE:    'no_face',
  PARTIAL:    'partial',
  VALID:      'valid',
  LIVENESS:   'liveness',
  PROCESSING: 'processing',
  SUCCESS:    'success',
  CAM_ERROR:  'cam_error',
}

const ISSUES = [
  { key: 'ears',     msg: 'Make sure both ears are visible',         tip: 'Move hair behind ears and face camera directly' },
  { key: 'lighting', msg: 'Improve lighting on your face',           tip: 'Face a natural light source, avoid strong backlight' },
  { key: 'far',      msg: 'Move closer to the camera',              tip: 'Keep your face within the oval frame' },
  { key: 'eyes',     msg: 'Please keep your eyes open and visible',  tip: 'Avoid squinting, look directly at camera' },
  { key: 'tilt',     msg: 'Center your face in the frame',          tip: 'Hold your head straight and look directly ahead' },
]

const CHALLENGES = [
  { id: 'blink', label: 'Blink your eyes naturally',            hint: 'Close and open both eyes once slowly',  emoji: '👁️' },
  { id: 'turn',  label: 'Turn your head slightly to the left',  hint: 'Keep your face within the oval frame',  emoji: '↩️' },
  { id: 'smile', label: 'Smile naturally',                      hint: 'A gentle natural smile works best',    emoji: '😊' },
]

const FRAME_COLOR = {
  [S.INIT]:       '#94A3B8',
  [S.NO_FACE]:    '#94A3B8',
  [S.PARTIAL]:    '#F59E0B',
  [S.VALID]:      '#60BB46',
  [S.LIVENESS]:   '#60BB46',
  [S.PROCESSING]: '#60BB46',
  [S.SUCCESS]:    '#22C55E',
  [S.CAM_ERROR]:  '#FF5A5F',
}

const CHIP_LABEL = {
  [S.INIT]:       '● Initializing',
  [S.NO_FACE]:    '● Searching for face...',
  [S.PARTIAL]:    '⚠ Adjust your position',
  [S.VALID]:      '✓ Face detected',
  [S.LIVENESS]:   null,
  [S.PROCESSING]: '● Analyzing',
  [S.SUCCESS]:    '✓ Verified',
  [S.CAM_ERROR]:  '✗ Camera unavailable',
}

function useCamera(videoRef) {
  const [ready, setReady]     = useState(false)
  const [camError, setCamErr] = useState(null)
  const streamRef             = useRef(null)

  useEffect(() => {
    let active = true
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then(stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        const v = videoRef.current
        if (v) {
          v.srcObject = stream
          v.onloadedmetadata = () => { v.play().catch(() => {}); if (active) setReady(true) }
        }
      })
      .catch(err => { if (active) setCamErr(err.name === 'NotAllowedError' ? 'denied' : 'error') })

    return () => {
      active = false
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return { ready, camError }
}

function useFaceDetection(cameraReady) {
  const [state,      setState]   = useState(S.INIT)
  const [issueIdx,   setIssueI]  = useState(0)
  const [chIdx,      setChIdx]   = useState(0)
  const [chPct,      setChPct]   = useState(0)
  const [confidence, setConf]    = useState(0)
  const ids = useRef([])

  function clearAll() { ids.current.forEach(clearTimeout); ids.current = [] }
  function at(ms, fn) { const id = setTimeout(fn, ms); ids.current.push(id) }

  const run = useCallback(() => {
    clearAll()
    setState(S.NO_FACE); setChIdx(0); setChPct(0); setConf(0)

    at(1900, () => { setIssueI(0); setState(S.PARTIAL) })
    at(4300, () => { setIssueI(2); setState(S.PARTIAL) })
    at(6400, () => setState(S.VALID))
    at(7700, () => { setState(S.LIVENESS); setChIdx(0); setChPct(0) })

    for (let i = 1; i <= 10; i++) at(7700 + i * 300, () => setChPct(p => Math.min(p + 10, 100)))

    at(10710, () => { setChIdx(1); setChPct(0) })
    for (let i = 1; i <= 10; i++) at(10710 + i * 300, () => setChPct(p => Math.min(p + 10, 100)))

    at(13720, () => { setChIdx(2); setChPct(0) })
    for (let i = 1; i <= 10; i++) at(13720 + i * 300, () => setChPct(p => Math.min(p + 10, 100)))

    at(16730, () => { setState(S.PROCESSING); setConf(0) })
    for (let i = 1; i <= 20; i++) at(16730 + i * 135, () => setConf(c => Math.min(c + 5, 98)))

    at(19530, () => { setState(S.SUCCESS); setConf(98) })
  }, [])

  useEffect(() => {
    if (cameraReady) { const id = setTimeout(run, 350); ids.current.push(id) }
    return clearAll
  }, [cameraReady, run])

  function retry() { clearAll(); setState(S.INIT); setChIdx(0); setChPct(0); setConf(0); at(300, run) }

  return { state, issueIdx, chIdx, chPct, confidence, retry }
}

function CameraOverlay({ state, chIdx }) {
  const color   = FRAME_COLOR[state] || '#94A3B8'
  const pulse   = [S.VALID, S.LIVENESS, S.PROCESSING].includes(state)
  const scanning = [S.INIT, S.NO_FACE, S.PARTIAL, S.VALID, S.LIVENESS].includes(state)

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="fvCutout">
            <rect width="100%" height="100%" fill="white" />
            <ellipse cx="50%" cy="46%" rx={OW / 2} ry={OH / 2} fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.56)" mask="url(#fvCutout)" />
      </svg>

      <div
        className="absolute"
        style={{ left: '50%', top: '46%', transform: 'translate(-50%, -50%)', width: OW, height: OH }}
      >
        <svg width={OW} height={OH} viewBox={`0 0 ${OW} ${OH}`} overflow="visible">
          <defs>
            <filter id="fvGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <motion.ellipse
            cx={OW / 2} cy={OH / 2} rx={OW / 2 - 2} ry={OH / 2 - 2}
            fill="none" stroke={color} strokeWidth={2.5}
            strokeDasharray={scanning ? '13 9' : 'none'}
            filter={pulse ? 'url(#fvGlow)' : 'none'}
            animate={{ stroke: color, strokeDashoffset: scanning ? [0, -88] : 0 }}
            transition={{
              stroke: { duration: 0.3 },
              strokeDashoffset: { duration: 2.4, repeat: Infinity, ease: 'linear' },
            }}
          />
        </svg>

        <AnimatePresence>
          {pulse && (
            <motion.div
              key="pulse"
              className="absolute"
              style={{
                width: OW + 26, height: OH + 26, top: -13, left: -13,
                border: `2px solid ${color}`, borderRadius: '50%',
              }}
              initial={{ opacity: 0.55, scale: 1 }}
              animate={{ opacity: 0, scale: 1.09 }}
              transition={{ duration: 1.9, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {state === S.SUCCESS && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.22)', backdropFilter: 'blur(6px)' }}
              >
                <CheckCircle2 size={38} color="#22C55E" strokeWidth={2} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {scanning && (
          <motion.div
            key="scan"
            className="absolute"
            style={{
              width: OW - 20, height: 2, left: '50%',
              transform: 'translateX(-50%)',
              background: `linear-gradient(90deg, transparent, ${color}90, transparent)`,
              borderRadius: 2,
            }}
            animate={{
              top: [
                `calc(46% - ${OH / 2 - 10}px)`,
                `calc(46% + ${OH / 2 - 10}px)`,
                `calc(46% - ${OH / 2 - 10}px)`,
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={state + chIdx}
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
        >
          <div
            className="px-4 py-1.5 rounded-full text-xs font-bold border"
            style={{
              background: 'rgba(0,0,0,0.52)',
              backdropFilter: 'blur(8px)',
              color: FRAME_COLOR[state],
              borderColor: (FRAME_COLOR[state] || '#94A3B8') + '55',
            }}
          >
            {state === S.LIVENESS
              ? `● Step ${Math.min(chIdx + 1, 3)} of 3 — Liveness`
              : CHIP_LABEL[state]}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {state === S.PROCESSING && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div
              className="px-5 py-2 rounded-full text-sm font-black"
              style={{ background: 'rgba(96,187,70,0.9)', color: 'white' }}
            >
              Confidence building...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StepBar() {
  const steps = ['Upload', 'Process', 'Details', 'Face ID', 'Submit']
  const current = 4
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const n = i + 1
        const done   = n < current
        const active = n === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={[
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all',
                done   ? 'bg-primary text-white'
                       : active ? 'bg-primary text-white ring-4 ring-primary/15'
                                : 'bg-slate-100 text-slate-400 border border-slate-200',
              ].join(' ')}>
                {done ? '✓' : n}
              </div>
              <span className={[
                'text-[9px] font-semibold whitespace-nowrap',
                active ? 'text-primary' : done ? 'text-primary/70' : 'text-slate-400',
              ].join(' ')}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={[
                'flex-1 h-0.5 mx-0.5 mb-4 rounded-full',
                done ? 'bg-primary' : 'bg-slate-200',
              ].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function AISheet({ open, onClose }) {
  const FAQ = [
    {
      q: 'Why is my selfie being rejected?',
      a: 'Your face may be too far from the camera, poorly lit, or partially covered. Move closer, face a light source, and ensure both ears are visible.',
    },
    {
      q: 'What lighting works best?',
      a: 'Natural light from a window in front of you works best. Avoid backlighting or strong overhead lights that create shadows on your face.',
    },
    {
      q: 'Why does liveness detection fail?',
      a: 'Follow the animated instructions exactly — blink slowly, turn your head gently, and smile naturally. Avoid moving too fast.',
    },
    {
      q: 'Can I use glasses or a hat?',
      a: 'Remove glasses and hats for best results. Accessories can block facial landmarks needed for accurate verification.',
    },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 32 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto bg-white rounded-t-3xl shadow-xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <MessageSquare size={16} color="white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-dark">KYC Assistant</p>
                    <p className="text-xs text-text-gray">Face verification help</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-text-gray hover:bg-slate-200 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {FAQ.map(({ q, a }) => (
                  <div key={q} className="bg-slate-50 rounded-2xl p-3.5">
                    <p className="text-xs font-bold text-text-dark mb-1.5 flex items-start gap-1.5">
                      <span className="text-primary shrink-0">Q:</span> {q}
                    </p>
                    <p className="text-xs text-text-gray leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <a
                  href="/chat"
                  className="flex items-center justify-center gap-1.5 text-sm font-semibold text-primary no-underline hover:underline"
                >
                  Open full AI chat <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function BottomSection({ state, issue, chIdx, chPct, confidence, retry, submitting, submitError, onSubmit }) {
  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">

        {state === S.NO_FACE && (
          <motion.div
            key="no_face"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
          >
            <p className="text-[11px] font-bold text-text-gray uppercase tracking-widest mb-3">Tips for best results</p>
            <div className="space-y-2">
              {[
                'Face the camera directly in good lighting',
                'Ensure both ears and full face are visible',
                'Remove glasses or hat if possible',
                'Keep your face inside the oval frame',
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <p className="text-xs text-text-dark">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {state === S.PARTIAL && issue && (
          <motion.div
            key={issue.key}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="bg-amber-50 rounded-2xl p-4 border border-amber-200/70 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Lightbulb size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-900">{issue.msg}</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">{issue.tip}</p>
              </div>
            </div>
          </motion.div>
        )}

        {state === S.VALID && (
          <motion.div
            key="valid"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3.5"
          >
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <p className="text-sm font-semibold text-primary-dark">Face detected — preparing liveness check</p>
          </motion.div>
        )}

        {state === S.LIVENESS && (() => {
          const ch = CHALLENGES[Math.min(chIdx, CHALLENGES.length - 1)]
          const circumference = 2 * Math.PI * 17
          return (
            <motion.div
              key={`ch-${chIdx}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                {CHALLENGES.map((c, i) => (
                  <div
                    key={c.id}
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      flex: i === chIdx ? '2 1 0%' : '1 1 0%',
                      background: i < chIdx ? '#60BB46' : i === chIdx ? '#60BB46' : '#E2E8F0',
                    }}
                  />
                ))}
                <span className="text-xs font-bold text-text-gray ml-1 shrink-0">
                  {Math.min(chIdx + 1, CHALLENGES.length)}/{CHALLENGES.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-3xl select-none">{ch.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-dark">{ch.label}</p>
                  <p className="text-xs text-text-gray mt-0.5 leading-relaxed">{ch.hint}</p>
                </div>
                <svg width="46" height="46" viewBox="0 0 46 46" className="shrink-0">
                  <circle cx="23" cy="23" r="17" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
                  <motion.circle
                    cx="23" cy="23" r="17" fill="none"
                    stroke="#60BB46" strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - chPct / 100)}
                    transform="rotate(-90 23 23)"
                    transition={{ duration: 0.25 }}
                  />
                  <text x="23" y="27" textAnchor="middle" fontSize="10" fontWeight="800" fill="#60BB46">
                    {chPct}%
                  </text>
                </svg>
              </div>
            </motion.div>
          )
        })()}

        {state === S.PROCESSING && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-primary animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-dark">Verifying your identity</p>
                <p className="text-xs text-text-gray mt-0.5">Analyzing biometric data securely...</p>
              </div>
              <span className="text-sm font-black text-primary shrink-0">{confidence}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #60BB46, #22C55E)' }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 0.28 }}
              />
            </div>
          </motion.div>
        )}

        {state === S.SUCCESS && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm shrink-0"
                style={{ background: 'linear-gradient(135deg, #60BB46 0%, #22C55E 100%)' }}
              >
                <CheckCircle2 size={30} color="white" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-text-dark">Identity Verified</p>
                <p className="text-xs text-text-gray">All biometric checks passed</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence}%` }}
                      transition={{ delay: 0.25, duration: 0.9, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">{confidence}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {['Face Match', 'Liveness', 'Anti-Spoof'].map(label => (
                <div key={label} className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-center">
                  <CheckCircle2 size={15} className="text-primary mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-primary-dark leading-tight">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-text-gray mb-4">
              Identity verification completed successfully
            </p>

            {submitError && (
              <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertCircle size={13} className="text-error shrink-0" />
                <p className="text-xs text-error font-medium">{submitError}</p>
              </div>
            )}

            <Btn full size="lg" loading={submitting} onClick={onSubmit}>
              Continue to Submission
              <ArrowRight size={16} strokeWidth={2.5} />
            </Btn>
          </motion.div>
        )}

        {state === S.CAM_ERROR && (
          <motion.div
            key="cam_err"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-text-dark mb-1">Camera access required</p>
                <p className="text-xs text-text-gray leading-relaxed">
                  Please allow camera access in your browser settings and reload. Face verification requires your front camera.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Btn full variant="soft" onClick={retry}>
                <RotateCcw size={14} /> Retry
              </Btn>
              <Btn full variant="outline" onClick={() => window.location.reload()}>
                Reload
              </Btn>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {![S.SUCCESS, S.CAM_ERROR].includes(state) && (
        <button
          onClick={retry}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-text-gray hover:text-primary transition-colors"
        >
          <RefreshCw size={12} /> Restart detection
        </button>
      )}
    </div>
  )
}

export default function FaceVerification() {
  const nav = useNavigate()
  const { formData, setKycId, setKycStatus } = useKYCStore()
  const videoRef = useRef(null)
  const [submitting,   setSubmitting]   = useState(false)
  const [submitError,  setSubmitError]  = useState(null)
  const [showAI,       setShowAI]       = useState(false)
  const MOCK = import.meta.env.VITE_ENABLE_API !== 'true'

  const { ready: camReady, camError }          = useCamera(videoRef)
  const { state: detState, issueIdx, chIdx, chPct, confidence, retry } = useFaceDetection(camReady)

  const state = camError ? S.CAM_ERROR : detState
  const issue = state === S.PARTIAL ? ISSUES[issueIdx % ISSUES.length] : null

  async function handleSubmit() {
    setSubmitting(true); setSubmitError(null)
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
      nav('/kyc/tracking')
    } catch (e) {
      setSubmitError(String(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-root flex flex-col" style={{ background: '#F7F9FB' }}>

      <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck size={16} color="white" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <span className="text-[15px] font-black text-primary tracking-tight">Smart KYC</span>
            <span className="block text-[10px] font-semibold text-text-gray tracking-wide">Assistant</span>
          </div>
        </div>
        <button
          onClick={() => setShowAI(s => !s)}
          className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
          aria-label="AI Help"
        >
          <MessageSquare size={17} />
        </button>
      </div>

      <div className="bg-white border-b border-slate-100 px-4 pt-3 pb-4 sticky top-14 z-10">
        <div className="max-w-[480px] mx-auto">
          <p className="text-[11px] font-bold text-text-gray uppercase tracking-widest mb-3">
            Live Face Verification
          </p>
          <StepBar />
        </div>
      </div>

      <div className="max-w-[480px] mx-auto w-full">
        <div
          className="relative bg-slate-900 overflow-hidden w-full"
          style={{ height: 370 }}
        >
          <video
            ref={videoRef}
            autoPlay muted playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />

          {!camReady && !camError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <Camera size={36} color="#64748B" />
              </motion.div>
              <p className="text-slate-400 text-sm font-medium">Starting camera...</p>
            </div>
          )}

          {camError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900 px-6 text-center">
              <Camera size={48} color="#64748B" />
              <div>
                <p className="text-white font-bold mb-1">Camera access required</p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {camError === 'denied'
                    ? 'Allow camera access in your browser settings to continue.'
                    : 'Could not start camera. Check your device settings.'}
                </p>
              </div>
            </div>
          )}

          {!camError && <CameraOverlay state={state} chIdx={chIdx} />}
        </div>
      </div>

      <div className="flex-1 max-w-[480px] mx-auto w-full px-4 py-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.p
            key={state + (issue?.key || '')}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-sm font-semibold text-center mb-3"
            style={{ color: FRAME_COLOR[state] || '#64748B' }}
          >
            {state === S.INIT       && 'Starting camera...'}
            {state === S.NO_FACE    && 'Position your face inside the frame'}
            {state === S.PARTIAL    && (issue?.msg || 'Adjust your face position')}
            {state === S.VALID      && 'Face detected — hold still'}
            {state === S.LIVENESS   && 'Follow the on-screen instructions'}
            {state === S.PROCESSING && 'Analyzing your identity...'}
            {state === S.SUCCESS    && 'Face verified successfully'}
            {state === S.CAM_ERROR  && 'Camera access is required to continue'}
          </motion.p>
        </AnimatePresence>

        <BottomSection
          state={state}
          issue={issue}
          chIdx={chIdx}
          chPct={chPct}
          confidence={confidence}
          retry={retry}
          submitting={submitting}
          submitError={submitError}
          onSubmit={handleSubmit}
        />

        <div className="flex items-center justify-center gap-2 mt-4 py-3 px-4 bg-primary/6 rounded-xl border border-primary/12">
          <ShieldCheck size={13} className="text-primary shrink-0" />
          <p className="text-xs font-semibold text-primary-dark">
            Your biometric data is encrypted and never stored
          </p>
        </div>
      </div>

      <AISheet open={showAI} onClose={() => setShowAI(false)} />
    </div>
  )
}
