import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SplashScreen    from './pages/SplashScreen.jsx'
import Dashboard       from './pages/Dashboard.jsx'
import DocumentsPage   from './pages/DocumentsPage.jsx'
import KYCUpload       from './pages/KYCUpload.jsx'
import OCRProcessing   from './pages/OCRProcessing.jsx'
import KYCForm         from './pages/KYCForm.jsx'
import FaceVerification from './pages/FaceVerification.jsx'
import KYCTracking     from './pages/KYCTracking.jsx'
import ChatbotPage     from './pages/ChatbotPage.jsx'
import RejectionPage   from './pages/RejectionPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<SplashScreen />} />
        <Route path="/dashboard"          element={<Dashboard />} />
        <Route path="/kyc/upload"         element={<KYCUpload />} />
        <Route path="/kyc/processing"     element={<OCRProcessing />} />
        <Route path="/kyc/form"           element={<KYCForm />} />
        <Route path="/kyc/face-verify"    element={<FaceVerification />} />
        <Route path="/kyc/tracking"       element={<KYCTracking />} />
        <Route path="/documents"          element={<DocumentsPage />} />
        <Route path="/kyc/rejected"       element={<RejectionPage />} />
        <Route path="/chat"               element={<ChatbotPage />} />
        <Route path="*"                   element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
