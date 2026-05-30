import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKYCStatus } from "../services/api.js";
import {
  Navbar,
  Card,
  Btn,
  Input,
  Alert,
  Spinner,
  Badge,
} from "../components/UI.jsx";
import { useKYCStore } from "../store/kycStore.js";

const STAGES = [
  {
    key: "submitted",
    label: "Submitted",
    desc: "Your application has been received.",
  },
  {
    key: "under_review",
    label: "Under Review",
    desc: "Our team is verifying your documents.",
  },
  { key: "approved", label: "Approved", desc: "Your KYC has been verified." },
];

export default function KYCStatus() {
  const { kycId: storedId } = useKYCStore();
  const [inputId, setInputId] = useState(storedId || "");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  async function check() {
    if (!inputId.trim()) {
      setError("Enter your KYC ID");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getKYCStatus(inputId.trim());
      setStatus(data);
    } catch (error) {
      console.error(error);
      setError(
        typeof error === "string"
          ? error
          : error?.message || "Status check failed",
      );
    } finally {
      setLoading(false);
    }
  }

  const stageIdx = status
    ? STAGES.findIndex((s) => s.key === status.status)
    : -1;
  const isRejected = status?.status === "rejected";

  const badgeColor = {
    approved: "mint",
    rejected: "red",
    under_review: "amber",
    submitted: "blue",
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-8 fade-up">
          <h1 className="text-2xl font-bold mb-1">Check KYC Status</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Enter your KYC ID to see your verification progress
          </p>
        </div>

        <Card className="mb-6 fade-up">
          <div className="flex gap-3">
            <Input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="KYC-xxxxxxxxxxxx"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && check()}
            />
            <Btn onClick={check} loading={loading}>
              Check
            </Btn>
          </div>
          {error && (
            <div className="mt-3">
              <Alert type="error" message={error} />
            </div>
          )}
        </Card>

        {status && (
          <Card glow className="fade-up space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-mono mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  {status.kyc_id}
                </p>
                <Badge
                  label={status.status.replace("_", " ").toUpperCase()}
                  color={badgeColor[status.status] || "muted"}
                />
              </div>
              <div
                className="text-right text-xs"
                style={{ color: "var(--muted)" }}
              >
                Updated
                <br />
                {new Date(status.updated_at).toLocaleString()}
              </div>
            </div>

            {/* Stage tracker */}
            {!isRejected && (
              <div className="space-y-3">
                {STAGES.map((s, i) => {
                  const done = i < stageIdx;
                  const active = i === stageIdx;
                  return (
                    <div
                      key={s.key}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all
                      ${active ? "border-[var(--mint)] bg-[var(--mint-dim)]" : "border-[var(--border)] bg-[var(--card2)]"}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5
                        ${done ? "bg-[var(--mint)] text-[var(--bg)]" : ""}
                        ${active ? "bg-[var(--mint)] text-[var(--bg)] ring-4 ring-[var(--mint-dim)]" : ""}
                        ${!done && !active ? "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]" : ""}`}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${active ? "text-white" : ""}`}
                          style={{ color: active ? "white" : "var(--lgray)" }}
                        >
                          {s.label}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--muted)" }}
                        >
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rejection */}
            {isRejected && (
              <Alert
                type="error"
                message={`Rejected: ${status.rejection_reason || "Document could not be verified. Please resubmit with a clearer image."}`}
              />
            )}

            <div className="flex gap-3 flex-wrap">
              <Btn
                variant="outline"
                onClick={() => nav("/chat")}
                className="flex-1"
              >
                Ask KYC Chatbot
              </Btn>
              {isRejected && (
                <Btn onClick={() => nav("/kyc")} className="flex-1">
                  Resubmit KYC
                </Btn>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
