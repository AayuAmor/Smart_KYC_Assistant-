import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileImage, Upload, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react'
import { useKYCStore } from '../store/kycStore.js'
import { AppHeader, BottomNav } from '../components/UI.jsx'

const STATUS_CONFIG = {
  uploaded:     { label: 'Uploaded',     color: '#3B82F6', bg: '#EFF6FF',  Icon: Clock },
  processing:   { label: 'Processing',   color: '#F59E0B', bg: '#FFF7ED',  Icon: Clock },
  approved:     { label: 'Approved',     color: '#22C55E', bg: '#F0FDF4',  Icon: CheckCircle2 },
  rejected:     { label: 'Rejected',     color: '#EF4444', bg: '#FEF2F2',  Icon: XCircle },
}

const DOC_TYPE_LABELS = {
  citizenship: 'Citizenship Card',
  license:     'Driving License',
  passport:    'Passport',
  voter_id:    'Voter ID',
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DocumentsPage() {
  const nav = useNavigate()
  const { documentHistory, kycStatus } = useKYCStore()

  const enriched = documentHistory.map(doc => ({
    ...doc,
    status: kycStatus === 'approved' ? 'approved'
          : kycStatus === 'rejected' ? 'rejected'
          : doc.status,
  }))

  return (
    <div className="page-root pb-24">
      <AppHeader
        title="Uploaded Documents"
        back={() => nav('/dashboard')}
      />

      <div className="max-w-[480px] mx-auto px-4 py-5 space-y-4">

        {enriched.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <FileImage size={28} color="#94A3B8" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-text-dark mb-1">No documents yet</h3>
            <p className="text-sm text-text-gray mb-5">Upload your identity document to get started.</p>
            <button
              onClick={() => nav('/kyc/upload')}
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
            >
              <Upload size={15} strokeWidth={2.5} />
              Upload Document
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-text-gray uppercase tracking-widest">
                {enriched.length} document{enriched.length > 1 ? 's' : ''} uploaded
              </p>
              <button
                onClick={() => nav('/kyc/upload')}
                className="text-xs font-bold text-primary flex items-center gap-1"
              >
                <Upload size={12} strokeWidth={2.5} />
                Upload new
              </button>
            </div>

            {enriched.map((doc, idx) => {
              const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.uploaded
              const StatusIcon = cfg.Icon
              const hasFront = doc.previews?.front
              const hasBack = doc.previews?.back

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <div className="flex gap-3 p-4">
                    <div className={['grid gap-1.5 shrink-0', hasBack ? 'grid-cols-2' : 'grid-cols-1'].join(' ')}>
                      {hasFront && (
                        <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100" style={{ width: hasBack ? 72 : 96, height: 64 }}>
                          <img src={hasFront} alt="Front" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {hasBack && (
                        <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100" style={{ width: 72, height: 64 }}>
                          <img src={hasBack} alt="Back" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {!hasFront && (
                        <div className="rounded-xl bg-slate-100 flex items-center justify-center" style={{ width: 96, height: 64 }}>
                          <FileImage size={20} color="#94A3B8" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-text-dark leading-tight">
                            {DOC_TYPE_LABELS[doc.docType] || doc.docLabel || 'Document'}
                          </p>
                          <p className="text-[11px] text-text-gray mt-0.5">
                            {hasBack ? 'Front and Back' : 'Front only'} · {timeAgo(doc.uploadedAt)}
                          </p>
                        </div>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          <StatusIcon size={9} strokeWidth={2.5} />
                          {cfg.label}
                        </span>
                      </div>

                      {doc.kycId && (
                        <p className="text-[10px] font-mono text-text-gray mt-1.5 truncate">
                          Ref: {doc.kycId}
                        </p>
                      )}
                    </div>
                  </div>

                  {doc.status === 'rejected' && (
                    <div className="border-t border-red-100 bg-red-50 px-4 py-3 flex items-center justify-between">
                      <p className="text-xs text-red-600 font-medium">Verification failed</p>
                      <button
                        onClick={() => nav('/kyc/upload')}
                        className="text-xs font-bold text-error flex items-center gap-1"
                      >
                        Re-upload <ChevronRight size={11} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                  {doc.status === 'approved' && (
                    <div className="border-t border-green-100 bg-green-50 px-4 py-3">
                      <p className="text-xs text-green-700 font-medium">Identity verified successfully</p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </>
        )}
      </div>

      <BottomNav active="documents" />
    </div>
  )
}
