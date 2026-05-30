import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, X, CheckCircle2, AlertTriangle } from 'lucide-react'

/**
 * SearchableDropdown — eSewa-style searchable select.
 *
 * Props:
 *  label           string    — field label
 *  value           string    — current selected value
 *  options         string[]  — list of choices
 *  onChange        fn        — called with new selected value
 *  placeholder     string    — trigger placeholder text
 *  searchPlaceholder string  — search input placeholder
 *  error           string    — error message
 *  optional        bool      — show "(Optional)" tag
 *  disabled        bool      — disable interaction
 *  autoFilled      bool      — show "Auto-filled" badge
 */
export default function SearchableDropdown({
  label,
  value,
  options = [],
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  error,
  optional = false,
  disabled = false,
  autoFilled = false,
}) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef   = useRef(null)
  const searchRef = useRef(null)

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  /* Close on outside click */
  useEffect(() => {
    if (!open) return
    function onOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  /* Auto-focus search on open */
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 60)
  }, [open])

  function select(option) {
    onChange(option)
    setOpen(false)
    setQuery('')
  }

  function clear(e) {
    e.stopPropagation()
    onChange('')
  }

  const triggerCls = [
    'w-full bg-white border-2 rounded-xl px-4 py-3 text-sm',
    'flex items-center justify-between gap-2 select-none',
    'transition-all duration-200',
    disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer',
    error
      ? 'border-error'
      : open
      ? 'border-primary ring-2 ring-primary/15'
      : autoFilled
      ? 'border-primary/40 bg-primary/5 autofill-pop'
      : 'border-slate-200 hover:border-slate-300',
  ].join(' ')

  return (
    <div className="flex flex-col gap-1.5">

      {/* Label */}
      {label && (
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm font-semibold text-text-dark">{label}</label>
          {optional && (
            <span className="text-xs text-text-gray font-normal">(Optional)</span>
          )}
          <AnimatePresence>
            {autoFilled && (
              <motion.span
                key="af"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                <CheckCircle2 size={9} strokeWidth={2.5} /> Auto-filled
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Trigger + dropdown (relative anchor) */}
      <div className="relative" ref={wrapRef}>

        {/* Trigger */}
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          tabIndex={disabled ? -1 : 0}
          className={triggerCls}
          onClick={() => !disabled && setOpen(o => !o)}
          onKeyDown={e => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              setOpen(o => !o)
            }
            if (e.key === 'Escape') { setOpen(false); setQuery('') }
          }}
        >
          <span className={value ? 'text-text-dark' : 'text-slate-400'}>
            {value || placeholder}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {value && !disabled && (
              <button
                type="button"
                onClick={clear}
                aria-label="Clear"
                className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={12} />
              </button>
            )}
            <ChevronDown
              size={16}
              className={[
                'text-slate-400 transition-transform duration-200',
                open ? 'rotate-180' : '',
              ].join(' ')}
            />
          </div>
        </div>

        {/* Dropdown panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scaleY: 0.94 }}
              animate={{ opacity: 1, y: 0,  scaleY: 1    }}
              exit={{   opacity: 0, y: -6, scaleY: 0.94  }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
              style={{ transformOrigin: 'top' }}
              role="listbox"
              className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-[0_8px_28px_rgba(16,24,40,0.13)] overflow-hidden z-[60]"
            >
              {/* Search bar */}
              <div className="p-2 border-b border-slate-100">
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  <Search size={13} className="text-slate-400 shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder={searchPlaceholder}
                    className="flex-1 bg-transparent text-sm outline-none text-text-dark placeholder:text-slate-400"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400 text-center">
                    No matches found
                  </p>
                ) : (
                  filtered.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      role="option"
                      aria-selected={opt === value}
                      onClick={() => select(opt)}
                      className={[
                        'w-full text-left px-4 py-2.5 text-sm transition-colors',
                        opt === value
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text-dark hover:bg-slate-50',
                      ].join(' ')}
                    >
                      {opt}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
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
