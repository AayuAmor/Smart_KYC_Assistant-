# Smart KYC Assistant

> AI-powered identity verification platform for Nepali fintech services. Upload one document, get a fully filled form in 3 seconds, verify your face, and track your KYC status in real time.

**eSewa X WWF Hackathon 2026**

---

## What it does

Smart KYC Assistant eliminates manual data entry during identity verification. A user uploads their citizenship card, driving license, passport, or voter ID — GPT-4o Vision reads both sides, extracts every field, and fills the form automatically. No typing required.

```
Upload document → AI extracts fields → Review & confirm → Face verify → Track status → Done
```

---

## Key Features

- **Zero typing** — GPT-4o reads the English text from the back of the citizenship card directly. Name, DOB, address, gender — all filled automatically
- **4 document types** — Citizenship (front + back), Driving License (front), Passport (front + back), Voter ID (front)
- **Structured Nepal address** — Province, district, municipality, ward, and tole returned as separate fields with exact dropdown values
- **Document type validation** — Detects mismatch between selected and uploaded document type before processing
- **Live face verification** — GPT-4o Vision checks face detected, single face, eyes open, adequate lighting, liveness
- **Real-time AI feedback** — While under review, GPT-4o analyses submitted data field by field and shows green/amber/red assessment
- **AI chatbot** — Context-aware GPT-4o assistant answers in Nepali or English with the user's actual KYC status and rejection reason
- **Session persistence** — Form data, OCR results, document thumbnails, and status all survive browser refresh
- **Document history** — Every upload saved with thumbnails so users can see past submissions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Zustand |
| Backend | FastAPI, Python 3.11, SQLAlchemy async, PostgreSQL |
| AI — OCR | GPT-4o Vision (dual-image mode for citizenship/passport) |
| AI — Face | GPT-4o Vision (6-point biometric check) |
| AI — Chat | GPT-4o with conversation history |
| AI — Review | GPT-4o real-time field analysis |
| Database | PostgreSQL, Alembic migrations, asyncpg |

---

## Project Structure

```
Smart_KYC_Assistant/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── pages/     # 10 screens
│   │   ├── store/     # Zustand + localStorage persist
│   │   ├── services/  # api.js — all backend calls
│   │   └── components/
│   └── .env           # VITE_API_URL, VITE_ENABLE_API
│
└── backend/           # FastAPI app
    ├── app/
    │   ├── api/v1/endpoints/   # kyc, ocr, face, chat, feedback
    │   ├── services/           # business logic layer
    │   ├── ml/                 # GPT-4o Vision OCR engine
    │   ├── db/models/          # KYCRecord, Document, ChatMessage, FaceVerification
    │   └── core/               # config, logging, exceptions
    └── .env                    # DATABASE_URL, OPENAI_API_KEY
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL
- OpenAI API key (GPT-4o access)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Fill in DATABASE_URL and OPENAI_API_KEY in .env

alembic upgrade head
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000/api/v1 and VITE_ENABLE_API=true

npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

API docs at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/ocr/upload` | Upload document image(s), returns extracted fields |
| `POST` | `/api/v1/kyc/submit` | Submit KYC form, creates database record |
| `GET`  | `/api/v1/kyc/status/:id` | Poll real-time KYC status |
| `GET`  | `/api/v1/kyc/feedback/:id` | GPT-4o field-by-field review |
| `POST` | `/api/v1/face/verify` | Analyze selfie, validate liveness |
| `POST` | `/api/v1/chat/ask` | Context-aware KYC chatbot |

---

## KYC Status Flow

```
pending → submitted → under_review → approved
                                   ↘ rejected
```

Status transitions every 5 seconds via frontend polling. Auto-progression from `submitted` to `under_review` fires 30 seconds after submission via background task.

---

## Environment Variables

### Backend `.env`

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/smart_kyc
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:5173
UPLOAD_DIR=uploads
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_ENABLE_API=true
```

---

## Why GPT-4o Over Traditional OCR

Traditional OCR (EasyOCR + Tesseract) was the original implementation. It was replaced because:

- **Cold start** — EasyOCR loads a 100MB model taking 15-45 seconds. GPT-4o responds in 2-4 seconds
- **Nepali names** — EasyOCR transliterates Devanagari incorrectly. GPT-4o reads English from the card back directly
- **Address structure** — EasyOCR returns a flat string. GPT-4o returns province, district, municipality, ward, tole as separate fields
- **Classification** — EasyOCR needs a separate classifier module. GPT-4o classifies and extracts in one call

---

## Built With

- [React](https://react.dev) — Frontend framework
- [FastAPI](https://fastapi.tiangolo.com) — Backend framework
- [OpenAI GPT-4o](https://openai.com) — AI engine for OCR, face verification, and chat
- [PostgreSQL](https://postgresql.org) — Database
- [Zustand](https://zustand-demo.pmnd.rs) — State management
- [Framer Motion](https://www.framer.com/motion) — Animations

---

## License

Built for the eSewa X WWF Hackathon 2026. All rights reserved.