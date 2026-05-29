import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2, CheckCircle2, AlertCircle, X, Clock, XCircle,
  Home, Upload, BarChart2, MessageSquare, History,
  ShieldCheck, ArrowLeft, Bell, ChevronRight,
} from 'lucide-react'
import { cn } from '../utils/cn.js'

const btnVariants = {
  primary:   'bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/20',
  secondary: 'bg-white text-text-dark border border-slate-200 hover:bg-slate-50 shadow-sm',
  outline:   'bg-transparent text-primary border-2 border-primary hover:bg-primary/5',
  ghost:     'bg-transparent text-text-gray hover:bg-slate-100',
  danger:    'bg-error text-white hover:bg-red-600',
  soft:      'bg-primary/10 text-primary-dark hover:bg-primary/20',
}

const btnSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-[15px] rounded-xl',
}

export function Btn({
  children, onClick, disabled, loading,
  variant = 'primary', full = false, className = '', type = 'button', size = 'md',
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        btnVariants[variant],
        btnSizes[size],
        full && 'w-full',
        className,
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  )
}

export function Input({ label, error, hint, prefix, suffix, extracted, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="block text-sm font-semibold text-text-dark">
          {label}
          {extracted && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <CheckCircle2 className="h-3 w-3" />
              Auto-filled
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-gray font-medium pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          {...props}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-3 text-sm text-text-dark',
            'placeholder:text-slate-400 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            prefix && 'pl-14',
            suffix && 'pr-10',
            error
              ? 'border-error focus:ring-error/20 focus:border-error bg-red-50/30'
              : 'border-slate-200 hover:border-slate-300',
            className,
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-error font-medium">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-text-gray">{hint}</p>}
    </div>
  )
}

export function Card({ children, className = '', onClick, hover = false }) {
  const Component = hover || onClick ? motion.div : 'div'
  const motionProps = hover || onClick
    ? { whileHover: { y: -2, boxShadow: '0 8px 24px rgba(16,24,40,0.10)' }, transition: { duration: 0.18 } }
    : {}

  return (
    <Component
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-slate-100',
        'shadow-[0_1px_3px_rgba(16,24,40,0.04)]',
        (hover || onClick) && 'cursor-pointer transition-shadow',
        className,
      )}
      {...motionProps}
    >
      {children}
    </Component>
  )
}

export function AppHeader({ back, title, right, subtitle, logoMode = false }) {
  return (
    <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={back}
            className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-text-gray hover:bg-primary/10 hover:text-primary transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        {logoMode ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div className="leading-none">
              <span className="text-[15px] font-black text-primary tracking-tight">Smart KYC</span>
              <span className="block text-[10px] font-semibold text-text-gray tracking-wide">Assistant</span>
            </div>
          </div>
        ) : (
          <div>
            <span className="font-bold text-[15px] text-text-dark leading-tight block">{title}</span>
            {subtitle && <span className="text-xs text-text-gray">{subtitle}</span>}
          </div>
        )}
      </div>
      {right || (
        logoMode && (
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-text-gray hover:bg-slate-100 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-white" />
            </button>
          </div>
        )
      )}
    </div>
  )
}

export function StepHeader({ steps, current, onBack, title }) {
  return (
    <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-0 sticky top-0 z-20">
      <div className="flex items-center gap-3 mb-4">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-text-gray hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <h1 className="text-[15px] font-bold text-text-dark">{title}</h1>
      </div>
      <div className="flex items-center gap-0 pb-4">
        {steps.map((s, i) => {
          const n = i + 1
          const done = n < current
          const active = n === current
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  done && 'bg-primary text-white shadow-sm',
                  active && 'bg-primary text-white ring-4 ring-primary/15',
                  !done && !active && 'bg-slate-50 text-slate-400 border border-slate-200',
                )}>
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
                </div>
                <span className={cn('text-[10px] mt-1 font-semibold whitespace-nowrap', active ? 'text-primary' : done ? 'text-primary/70' : 'text-slate-400')}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-1 mb-4 rounded-full', done ? 'bg-primary' : 'bg-slate-200')} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TopBar({ title, back, right }) {
  return <AppHeader title={title} back={back} right={right} />
}

const badgeMap = {
  green:  'bg-primary/10 text-primary-dark',
  orange: 'bg-amber-50 text-amber-700',
  red:    'bg-red-50 text-error',
  gray:   'bg-slate-100 text-text-gray',
  blue:   'bg-blue-50 text-blue-600',
}

export function Badge({ label, color = 'green', className = '' }) {
  return (
    <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold', badgeMap[color] || badgeMap.gray, className)}>
      {label}
    </span>
  )
}

const statusConfig = {
  pending:         { label: 'Pending',         className: 'bg-slate-100 text-slate-600',    icon: Clock },
  under_review:    { label: 'Under Review',    className: 'bg-amber-50 text-amber-700',     icon: Clock },
  in_progress:     { label: 'In Progress',     className: 'bg-amber-50 text-amber-700',     icon: Loader2, spin: true },
  completed:       { label: 'Completed',       className: 'bg-green-50 text-success',       icon: CheckCircle2 },
  approved:        { label: 'Approved',        className: 'bg-green-50 text-success',       icon: CheckCircle2 },
  rejected:        { label: 'Rejected',        className: 'bg-red-50 text-error',           icon: XCircle },
  action_required: { label: 'Action Required', className: 'bg-orange-50 text-orange-700',  icon: AlertCircle },
}

export function StatusBadge({ status, className, size = 'md' }) {
  const cfg = statusConfig[status] || statusConfig.pending
  const Icon = cfg.icon
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-semibold',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      cfg.className, className,
    )}>
      <Icon className={cn('h-3.5 w-3.5', cfg.spin && 'animate-spin')} />
      {cfg.label}
    </span>
  )
}

export function Spinner({ size = 32 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="border-2 border-primary border-t-transparent rounded-full spin-anim mx-auto"
    />
  )
}

export function TrustBanner() {
  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-primary/8 rounded-xl text-xs font-semibold text-primary-dark border border-primary/15">
      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
      <span>Your information is encrypted and securely verified</span>
    </div>
  )
}

export function Modal({ isOpen, onClose, title, children, className = '' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
              'rounded-2xl bg-white p-6 shadow-[0_6px_20px_rgba(16,24,40,0.08)]',
              className,
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-dark">{title}</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-text-gray hover:bg-slate-100" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const navItems = [
  { id: 'dashboard', Icon: Home,          label: 'Home',      href: '/dashboard'    },
  { id: 'kyc',       Icon: Upload,        label: 'Upload',    href: '/kyc/upload'   },
  { id: 'tracking',  Icon: BarChart2,     label: 'Status',    href: '/kyc/tracking' },
  { id: 'chat',      Icon: MessageSquare, label: 'AI Help',   href: '/chat'         },
  { id: 'history',   Icon: History,       label: 'History',   href: '/kyc/tracking' },
]

export function BottomNav({ active }) {
  return (
    <nav className="bottom-nav-mobile fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-30 pb-safe">
      <div className="flex items-stretch max-w-[480px] mx-auto">
        {navItems.map(({ id, Icon, label, href }) => {
          const isActive = active === id
          return (
            <motion.a
              key={id}
              href={href}
              whileTap={{ scale: 0.92 }}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2.5 px-1',
                'text-[10px] font-semibold transition-colors no-underline',
                isActive ? 'text-primary' : 'text-slate-400',
              )}
            >
              <div className={cn(
                'w-10 h-6 rounded-full flex items-center justify-center transition-colors',
                isActive ? 'bg-primary/10' : '',
              )}>
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-primary' : 'text-slate-400'}
                />
              </div>
              {label}
            </motion.a>
          )
        })}
      </div>
    </nav>
  )
}

const sidebarItems = [
  { id: 'dashboard', Icon: Home,          label: 'Home',             href: '/dashboard'    },
  { id: 'kyc',       Icon: Upload,        label: 'Upload Document',  href: '/kyc/upload'   },
  { id: 'tracking',  Icon: BarChart2,     label: 'KYC Status',       href: '/kyc/tracking' },
  { id: 'chat',      Icon: MessageSquare, label: 'AI Assistant',     href: '/chat'         },
  { id: 'history',   Icon: History,       label: 'History',          href: '/kyc/tracking' },
]

export function Sidebar({ active }) {
  return (
    <aside className="sidebar fixed top-0 left-0 w-[220px] h-full bg-white border-r border-slate-100 z-20 flex-col">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[15px] font-black text-primary leading-tight">Smart KYC</div>
            <div className="text-[10px] font-semibold text-text-gray tracking-wide">Assistant</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarItems.map(({ id, Icon, label, href }) => {
          const isActive = active === id
          return (
            <a
              key={id}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors no-underline',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-gray hover:bg-slate-50 hover:text-text-dark',
              )}
            >
              <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </a>
          )
        })}
      </nav>

      <div className="m-3 p-4 bg-primary/8 rounded-2xl border border-primary/15">
        <p className="text-xs font-bold text-primary-dark mb-1">Need help with KYC?</p>
        <p className="text-[11px] text-text-gray mb-3 leading-relaxed">Chat with our AI Assistant</p>
        <a href="/chat" className="block w-full bg-primary text-white text-xs font-semibold text-center py-2 rounded-lg no-underline hover:bg-primary-dark transition-colors">
          Chat Now
        </a>
      </div>
    </aside>
  )
}

export function SectionLabel({ children, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[13px] font-bold text-text-dark tracking-wide uppercase">{children}</h3>
      {action && (
        <button onClick={onAction} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
          {action} <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
