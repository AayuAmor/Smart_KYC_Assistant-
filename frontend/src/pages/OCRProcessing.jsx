import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  ScanLine,
  FileImage,
  Search,
  ListChecks,
  LayoutList,
} from "lucide-react";
import { useKYCStore } from "../store/kycStore.js";

const STEPS = [
  { label: "Detecting document", Icon: FileImage },
  { label: "Enhancing image quality", Icon: ScanLine },
  { label: "Reading document text", Icon: Search },
  { label: "Extracting fields", Icon: ListChecks },
  { label: "Preparing your form", Icon: LayoutList },
];

export default function OCRProcessing() {
  const nav = useNavigate();
  const { docFile, docPreviews, setOcrResult, setFormData, formData } =
    useKYCStore();
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setStepIdx(i);
      if (i >= STEPS.length - 1) clearInterval(interval);
    }, 600);

    async function run() {
      if (!docFile?.front) {
        setError("Missing front document image. Please upload it again.");
        clearInterval(interval);
        return;
      }
      try {
        const fd = new FormData();
        fd.append("file", docFile.front, "front.jpg");
        fd.append("side", "front");
        if (docFile.back) {
          fd.append("back_file", docFile.back, "back.jpg");
        }
        const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${BASE}/ocr/upload`, { method: "POST", body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Upload failed: ${res.status}`);
        }
        const merged = await res.json();
        const conf = merged.overall_confidence ?? merged.ocr_confidence ?? null;
        setOcrConfidence(typeof conf === "number" ? Math.round(conf * 100) : null);
        setOcrResult(merged);
        setFormData({
          ...formData,
          full_name:              merged.full_name || "",
          dob:                    merged.dob || "",
          id_number:              merged.id_number || "",
          address:                merged.address || "",
          permanent_province:     merged.permanent_province || "",
          permanent_district:     merged.permanent_district || "",
          permanent_municipality: merged.permanent_municipality || "",
          permanent_ward:         merged.permanent_ward || "",
          permanent_tole:         merged.permanent_tole || "",
        });
        setDone(true);
      } catch (err) {
        setError(typeof err === "string" ? err : err?.message || "OCR extraction failed");
      }
    }
    run();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => nav("/kyc/form"), 900);
      return () => clearTimeout(t);
    }
  }, [done]);

  const pct = done ? 100 : Math.round(((stepIdx + 1) / STEPS.length) * 100);
  const docPreview = docPreviews?.front || null;

  return (
    <div className="page-root flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {docPreview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-auto mb-8 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
            style={{ maxWidth: 240 }}
          >
            <img
              src={docPreview}
              alt="Document"
              className="w-full object-cover rounded-2xl"
              style={{ maxHeight: 160 }}
            />
            {!done && (
              <div
                className="absolute left-0 right-0 h-0.5 opacity-80"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #60BB46, transparent)",
                  animation: "scan 1.6s ease-in-out infinite",
                  top: "10%",
                }}
              />
            )}
            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center rounded-2xl"
                  style={{ background: "rgba(96,187,70,0.18)" }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #60BB46, #3A8A28)",
                    }}
                  >
                    <CheckCircle2 size={28} color="#fff" strokeWidth={2.5} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <h2 className="text-xl font-black text-text-dark mb-1.5">
            {done ? "Extraction Complete!" : "Processing Document"}
          </h2>
          <p className="text-sm text-text-gray">
            {done
              ? "Your details have been extracted successfully."
              : "Our AI is reading your document..."}
          </p>
        </motion.div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-gray">
              Extraction Progress
            </span>
            <span className="text-xs font-bold text-primary">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #60BB46, #3A8A28)" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {done && ocrConfidence !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm"
          >
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="#F3F4F6"
                  strokeWidth="5"
                />
                <motion.circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="#60BB46"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={113}
                  initial={{ strokeDashoffset: 113 }}
                  animate={{
                    strokeDashoffset: 113 - (113 * ocrConfidence) / 100,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black text-primary">
                  {ocrConfidence}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-text-dark mb-0.5">
                Confidence Score
              </p>
              <span
                className={[
                  "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                  ocrConfidence >= 85
                    ? "text-primary bg-primary/10"
                    : ocrConfidence >= 60
                      ? "text-amber-600 bg-amber-50"
                      : "text-red-500 bg-red-50",
                ].join(" ")}
              >
                <CheckCircle2 size={11} strokeWidth={2.5} />
                {ocrConfidence >= 85
                  ? "High Confidence"
                  : ocrConfidence >= 60
                    ? "Medium Confidence"
                    : "Low Confidence"}
              </span>
            </div>
          </motion.div>
        )}

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
          {STEPS.map((s, i) => {
            const isDone = i < stepIdx || done;
            const isActive = i === stepIdx && !done;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: isDone || isActive ? 1 : 0.4 }}
                className="flex items-center gap-3"
              >
                <div
                  className={[
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all",
                    isDone
                      ? "bg-primary shadow-sm shadow-primary/25"
                      : isActive
                        ? "border-2 border-primary bg-primary/5"
                        : "bg-slate-100 border border-slate-200",
                  ].join(" ")}
                >
                  {isDone ? (
                    <CheckCircle2 size={13} color="#fff" strokeWidth={2.5} />
                  ) : isActive ? (
                    <Loader2 size={12} className="text-primary animate-spin" />
                  ) : (
                    <s.Icon size={12} className="text-slate-400" />
                  )}
                </div>
                <span
                  className={[
                    "text-sm font-medium transition-colors",
                    isDone
                      ? "text-text-dark"
                      : isActive
                        ? "text-primary font-semibold"
                        : "text-slate-400",
                  ].join(" ")}
                >
                  {s.label}
                </span>
                {isDone && (
                  <span className="ml-auto text-[10px] font-semibold text-primary">
                    Done
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {done && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs text-text-gray mt-4 font-medium"
          >
            Redirecting to review form...
          </motion.p>
        )}
      </div>
    </div>
  );
}
