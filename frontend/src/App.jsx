import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function Placeholder({ name }) {
  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>{name}</h1>
      <p>Original page components are not copied yet. Replace when ready.</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder name="SplashScreen (placeholder)" />} />
        <Route path="/dashboard" element={<Placeholder name="Dashboard (placeholder)" />} />
        <Route path="/kyc/upload" element={<Placeholder name="KYCUpload (placeholder)" />} />
        <Route path="/kyc/processing" element={<Placeholder name="OCRProcessing (placeholder)" />} />
        <Route path="/kyc/form" element={<Placeholder name="KYCForm (placeholder)" />} />
        <Route path="/kyc/face-verify" element={<Placeholder name="FaceVerification (placeholder)" />} />
        <Route path="/kyc/tracking" element={<Placeholder name="KYCTracking (placeholder)" />} />
        <Route path="/kyc/rejected" element={<Placeholder name="RejectionPage (placeholder)" />} />
        <Route path="/chat" element={<Placeholder name="ChatbotPage (placeholder)" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
