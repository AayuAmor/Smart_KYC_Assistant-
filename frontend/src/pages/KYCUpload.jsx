import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CloudUpload,
  CreditCard,
  BookOpen,
  Car,
  Vote,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useKYCStore } from "../store/kycStore.js";
import { Btn, StepHeader } from "../components/UI.jsx";

const DOC_TYPES = [
  {
    id: "citizenship",
    Icon: CreditCard,
    label: "Citizenship",
    sub: "Front & Back",
    sides: ["front", "back"],
  },
  {
    id: "license",
    Icon: Car,
    label: "Driving License",
    sub: "Front only",
    sides: ["front"],
  },
  {
    id: "passport",
    Icon: BookOpen,
    label: "Passport",
    sub: "Front & Back",
    sides: ["front", "back"],
  },
  {
    id: "voter_id",
    Icon: Vote,
    label: "Voter ID",
    sub: "Front only",
    sides: ["front"],
  },
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function KYCUpload() {
  const nav = useNavigate();
  const { docFile, setDocFile, formData, setFormData, addDocumentHistory } = useKYCStore();
  const [docType, setDocType] = useState("citizenship");
  const [previews, setPreviews] = useState({ front: null, back: null });
  const [draggingSide, setDraggingSide] = useState(null);
  const frontRef = useRef();
  const backRef = useRef();

  const currentDocType = DOC_TYPES.find((d) => d.id === docType);

  async function handleFile(file, side) {
    if (!file) return;
    const base64 = await fileToBase64(file)
    const updatedPreviews = { ...previews, [side]: base64 };
    const nextFiles = { ...(docFile || {}), [side]: file };
    setPreviews(updatedPreviews);
    setFormData({ ...formData, document_type: docType });
    setDocFile(nextFiles, updatedPreviews);
  }

  function handleDocTypeChange(id) {
    setDocType(id);
    setPreviews({ front: null, back: null });
    setDocFile({}, { front: null, back: null });
    setFormData({ ...formData, document_type: id });
  }

  const allSidesUploaded = currentDocType.sides.every((s) => previews[s]);

  return (
    <div className="page-root pb-8">
      <StepHeader
        steps={["Upload", "Processing", "Review", "Submit"]}
        current={1}
        onBack={() => nav("/dashboard")}
        title="Upload Document"
      />

      <div className="max-w-[480px] mx-auto px-4 py-5 space-y-4">
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3.5">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-bold text-primary-dark">
              AI will automatically extract your details
            </p>
            <p className="text-xs text-primary/70 mt-0.5">
              No manual typing needed — just upload a clear photo
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-text-gray uppercase tracking-widest mb-3 px-0.5">
            Select Document Type
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {DOC_TYPES.map(({ id, Icon, label, sub }) => {
              const active = docType === id;
              return (
                <motion.button
                  key={id}
                  onClick={() => handleDocTypeChange(id)}
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-col items-center p-3.5 rounded-2xl border-2 transition-all text-center"
                  style={{
                    borderColor: active ? "#60BB46" : "#E5E7EB",
                    background: active ? "#EBF7E6" : "#fff",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                    style={{ background: active ? "#60BB46" : "#F3F4F6" }}
                  >
                    <Icon
                      size={18}
                      color={active ? "#fff" : "#6B7280"}
                      strokeWidth={2}
                    />
                  </div>
                  <p className="text-xs font-bold text-text-dark leading-tight">
                    {label}
                  </p>
                  <p className="text-[10px] text-text-gray mt-0.5">{sub}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {currentDocType.sides.map((side) => {
            const ref = side === "front" ? frontRef : backRef;
            const preview = previews[side];
            const label = side === "front" ? "Front Side" : "Back Side";

            return (
              <div key={side}>
                <p className="text-xs font-bold text-text-gray uppercase tracking-widest mb-2 px-0.5">
                  {label}
                </p>
                <div
                  onClick={() => ref.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDraggingSide(side);
                  }}
                  onDragLeave={() => setDraggingSide(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDraggingSide(null);
                    handleFile(e.dataTransfer.files[0], side);
                  }}
                  className="relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all"
                  style={{
                    borderColor:
                      draggingSide === side
                        ? "#60BB46"
                        : preview
                          ? "#60BB46"
                          : "#D1D5DB",
                    background:
                      draggingSide === side
                        ? "#EBF7E6"
                        : preview
                          ? "#F0FDF4"
                          : "#FAFAFA",
                    minHeight: 120,
                  }}
                >
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt={label}
                        className="w-full object-cover rounded-2xl"
                        style={{ maxHeight: 160 }}
                      />
                      <div
                        className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: "rgba(96,187,70,0.9)",
                          color: "white",
                        }}
                      >
                        ✓ Uploaded
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <CloudUpload size={22} color="#94A3B8" />
                      </div>
                      <p className="text-sm font-semibold text-text-dark">
                        Tap to upload {label}
                      </p>
                      <p className="text-xs text-text-gray">
                        JPG, PNG or PDF — max 10MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={ref}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0], side)}
                />
              </div>
            );
          })}
        </div>

        <div className="bg-amber-50 border border-amber-200/70 rounded-2xl px-4 py-3.5">
          <p className="text-xs font-bold text-amber-800 mb-2">
            📸 Tips for best results
          </p>
          <ul className="space-y-1">
            {[
              "Use clear lighting — avoid shadows or glare",
              "Ensure all 4 corners of the document are visible",
              "Keep the document flat and stable",
            ].map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-xs text-amber-700"
              >
                <span className="mt-0.5 shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <Btn
          full
          size="lg"
          disabled={!allSidesUploaded}
          onClick={() => {
            const DOC_LABELS = { citizenship: 'Citizenship', license: 'Driving License', passport: 'Passport', voter_id: 'Voter ID' }
            addDocumentHistory({
              id: Date.now().toString(),
              docType: formData.document_type || 'citizenship',
              docLabel: DOC_LABELS[formData.document_type] || 'Document',
              previews: { ...previews },
              uploadedAt: new Date().toISOString(),
              status: 'uploaded',
              kycId: null,
            })
            nav('/kyc/processing')
          }}
          className="shadow-sm shadow-primary/20"
        >
          Extract with AI
          <ArrowRight size={16} strokeWidth={2.5} />
        </Btn>
      </div>
    </div>
  );
}
