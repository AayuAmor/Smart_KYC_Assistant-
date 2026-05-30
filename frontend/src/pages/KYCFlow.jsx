import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useKYCStore } from "../store/kycStore.js";
import { uploadDocument, submitKYC } from "../services/api.js";
import {
  Navbar,
  StepBar,
  Card,
  Btn,
  Input,
  Alert,
  Spinner,
  Badge,
} from "../components/UI.jsx";

const STEPS = ["Upload Doc", "Fill Form", "Review", "Submit"];
const DOC_TYPES = [
  { value: "citizenship", label: "Citizenship Card" },
  { value: "passport", label: "Passport" },
  { value: "driving", label: "Driving License" },
];

function validate(form) {
  const errs = {};
  if (!form.full_name.trim()) errs.full_name = "Full name is required";
  if (!form.dob) errs.dob = "Date of birth is required";
  if (!form.id_number.trim()) errs.id_number = "ID number is required";
  if (!form.phone.match(/^\+?[0-9]{10,15}$/))
    errs.phone = "Enter a valid phone number";
  if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
    errs.email = "Enter a valid email";
  if (!form.address.trim()) errs.address = "Address is required";

  const dob = new Date(form.dob);
  const age = (Date.now() - dob) / (1000 * 60 * 60 * 24 * 365);
  if (age < 16 || age > 120) errs.dob = "Invalid date of birth";
  return errs;
}

/* ── Step 1: Upload ──────────────────────────────────────────────────────────── */
function UploadStep({ onNext }) {
  const {
    docFile,
    setDocFile,
    setOcrResult,
    formData,
    setFormData,
    ocrResult,
  } = useKYCStore();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [docType, setDocType] = useState("citizenship");
  const inputRef = useRef();

  async function handleFile(file) {
    if (!file) return;
    setDocFile(
      { front: file },
      { front: URL.createObjectURL(file), back: null },
    );
    setPreview(URL.createObjectURL(file));
    setError(null);
    setSuccess(null);
  }

  async function handleExtract() {
    if (!docFile?.front) {
      setError("Please upload a document first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await uploadDocument(docFile.front, "front");
      setOcrResult(data);
      setFormData({
        ...formData,
        full_name: data.full_name || "",
        dob: data.dob || "",
        id_number: data.id_number || "",
        address: data.address || "",
        document_type: docType,
      });
      const confidence = data.overall_confidence ?? data.ocr_confidence ?? null;
      setSuccess(
        confidence != null
          ? `Extracted with ${Math.round(confidence * 100)}% confidence`
          : "OCR complete",
      );
    } catch (error) {
      console.error(error);
      setError(
        typeof error === "string"
          ? error
          : error?.message || "OCR extraction failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 fade-up">
      <div>
        <h2 className="text-xl font-bold mb-1">Upload Identity Document</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          We'll extract your details automatically using OCR
        </p>
      </div>

      {/* Doc type selector */}
      <div className="flex gap-2 flex-wrap">
        {DOC_TYPES.map((d) => (
          <button
            key={d.value}
            onClick={() => setDocType(d.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${docType === d.value ? "border-[var(--mint)] text-[var(--mint)] bg-[var(--mint-dim)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--teal)]"}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-[var(--mint)] hover:bg-[var(--mint-dim)]"
        style={{
          borderColor: preview ? "var(--mint)" : "var(--border)",
          background: preview ? "var(--mint-dim)" : "var(--card2)",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {preview ? (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Document preview"
              className="max-h-40 mx-auto rounded-lg object-contain"
            />
            <p className="text-xs" style={{ color: "var(--mint)" }}>
              Document ready · Click to change
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl">📄</div>
            <p className="text-sm font-semibold text-white">
              Drop document here or click to browse
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              JPG, PNG, PDF supported · Max 10MB
            </p>
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={`OCR complete: ${success}`} />}

      <div className="flex gap-3">
        <Btn
          onClick={handleExtract}
          loading={loading}
          disabled={!docFile?.front}
          className="flex-1"
        >
          {loading ? "Extracting..." : "Extract with OCR"}
        </Btn>
        {success && (
          <Btn variant="outline" onClick={onNext} className="flex-1">
            Continue to Form →
          </Btn>
        )}
      </div>
    </div>
  );
}

/* ── Step 2: Smart Form ──────────────────────────────────────────────────────── */
function FormStep({ onNext, onBack }) {
  const { formData, setFormData, ocrResult } = useKYCStore();
  const [errors, setErrors] = useState({});

  function handle(field, val) {
    setFormData({ ...formData, [field]: val });
    if (errors[field])
      setErrors((e) => {
        const n = { ...e };
        delete n[field];
        return n;
      });
  }

  function handleNext() {
    const errs = validate(formData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onNext();
  }

  return (
    <div className="space-y-5 fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">Verify Your Details</h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Fields are pre-filled from OCR. Review and correct if needed.
          </p>
        </div>
        {ocrResult &&
          (ocrResult.overall_confidence ?? ocrResult.ocr_confidence) !=
            null && (
            <Badge
              label={`OCR ${Math.round((ocrResult.overall_confidence ?? ocrResult.ocr_confidence) * 100)}%`}
              color="mint"
            />
          )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={formData.full_name}
          onChange={(e) => handle("full_name", e.target.value)}
          error={errors.full_name}
          placeholder="As on document"
        />
        <Input
          label="Date of Birth"
          type="date"
          value={formData.dob}
          onChange={(e) => handle("dob", e.target.value)}
          error={errors.dob}
        />
        <Input
          label="ID Number"
          value={formData.id_number}
          onChange={(e) => handle("id_number", e.target.value)}
          error={errors.id_number}
          placeholder="Citizenship / Passport no."
        />
        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => handle("address", e.target.value)}
          error={errors.address}
          placeholder="Permanent address"
        />
        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handle("phone", e.target.value)}
          error={errors.phone}
          placeholder="+977 98XXXXXXXX"
          type="tel"
        />
        <Input
          label="Email"
          value={formData.email}
          onChange={(e) => handle("email", e.target.value)}
          error={errors.email}
          placeholder="you@example.com"
          type="email"
        />
      </div>

      <div className="flex gap-3">
        <Btn variant="ghost" onClick={onBack}>
          ← Back
        </Btn>
        <Btn onClick={handleNext} className="flex-1">
          Review & Submit →
        </Btn>
      </div>
    </div>
  );
}

/* ── Step 3: Review ──────────────────────────────────────────────────────────── */
function ReviewStep({ onNext, onBack }) {
  const { formData } = useKYCStore();
  const fields = [
    ["Full Name", formData.full_name],
    ["Date of Birth", formData.dob],
    ["ID Number", formData.id_number],
    ["Address", formData.address],
    ["Phone", formData.phone],
    ["Email", formData.email],
    ["Document Type", formData.document_type],
  ];
  return (
    <div className="space-y-5 fade-up">
      <div>
        <h2 className="text-xl font-bold mb-1">Review Your Submission</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Check everything before final submission
        </p>
      </div>
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        {fields.map(([label, value], i) => (
          <div
            key={label}
            className={`flex justify-between items-center px-5 py-3.5 text-sm ${i % 2 === 0 ? "bg-[var(--card)]" : "bg-[var(--card2)]"}`}
          >
            <span style={{ color: "var(--muted)" }}>{label}</span>
            <span className="font-medium text-right">{value || "—"}</span>
          </div>
        ))}
      </div>
      <Alert
        type="info"
        message="By submitting you confirm all details match your original document."
      />
      <div className="flex gap-3">
        <Btn variant="ghost" onClick={onBack}>
          ← Edit
        </Btn>
        <Btn onClick={onNext} className="flex-1">
          Confirm & Submit
        </Btn>
      </div>
    </div>
  );
}

/* ── Step 4: Result ──────────────────────────────────────────────────────────── */
function ResultStep() {
  const { kycId, reset } = useKYCStore();
  const nav = useNavigate();
  return (
    <div className="text-center space-y-6 fade-up py-4">
      <div className="text-5xl">🎉</div>
      <div>
        <h2 className="text-xl font-bold mb-2">KYC Submitted Successfully</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Your application is under review. You'll be notified via email.
        </p>
      </div>
      {kycId && (
        <div
          className="p-4 rounded-xl border text-sm font-mono"
          style={{ background: "var(--card2)", borderColor: "var(--border)" }}
        >
          KYC ID: <span style={{ color: "var(--mint)" }}>{kycId}</span>
        </div>
      )}
      <div className="flex gap-3 justify-center flex-wrap">
        <Btn onClick={() => nav("/status")}>Check Status</Btn>
        <Btn variant="outline" onClick={() => nav("/chat")}>
          Ask KYC Chatbot
        </Btn>
        <Btn
          variant="ghost"
          onClick={() => {
            reset();
            nav("/");
          }}
        >
          Back to Home
        </Btn>
      </div>
    </div>
  );
}

/* ── Main KYC Flow ───────────────────────────────────────────────────────────── */
export default function KYCFlow() {
  const { step, setStep, formData, setKycId } = useKYCStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const data = await submitKYC(formData);
      setKycId(data.kyc_id);
      setStep(5);
    } catch (error) {
      console.error(error);
      setError(
        typeof error === "string"
          ? error
          : error?.message || "KYC submission failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        {/* Progress */}
        <div className="mb-8">
          <StepBar current={Math.min(step, 4)} total={4} labels={STEPS} />
        </div>

        <Card glow>
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} />
            </div>
          )}

          {step === 1 && <UploadStep onNext={() => setStep(2)} />}
          {step === 2 && (
            <FormStep onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <ReviewStep onNext={handleSubmit} onBack={() => setStep(2)} />
          )}
          {step === 4 && (
            <div className="text-center py-8">
              <Spinner size={40} />
              <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
                Submitting your KYC application...
              </p>
            </div>
          )}
          {step === 5 && <ResultStep />}
        </Card>
      </div>
    </div>
  );
}
