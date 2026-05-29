# Smart KYC Assistant

AI-powered KYC onboarding system for eSewa — eSewa Hackathon 2026, Challenge 4.

## Quick Start

### Frontend (demo mode — no backend needed)
```bash
npm install
cp .env.example .env   # VITE_ENABLE_API=false by default
npm run dev            # http://localhost:5173
```

### Backend
```bash
# Install tesseract: sudo apt install tesseract-ocr (Ubuntu) or brew install tesseract (Mac)
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add ANTHROPIC_API_KEY and DATABASE_URL
uvicorn app.main:app --reload --port 8000
```

## API Endpoints
| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| POST   | /api/ocr/upload       | OCR document extraction|
| POST   | /api/kyc/submit       | Submit KYC application |
| GET    | /api/kyc/status/{id}  | Get KYC status         |
| POST   | /api/chat/ask         | AI chatbot             |

## Team: The Dobermans
Aayush Kumar Raut · Jharna Adhikari · Swarit Nidhi · Nabijan Ansari
