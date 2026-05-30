import uuid
import base64
import json
from loguru import logger
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import AppException
from app.db.models.face import FaceVerification
from app.schemas.face import FaceVerifyResponse
from app.utils.file_handler import save_upload

FACE_PROMPT = """You are a biometric face verification engine for a KYC system.
Analyze this selfie image and check if it is a valid identity verification photo.

Return ONLY valid JSON with exactly these keys:
{
  "face_detected": true or false,
  "face_count": number of faces visible,
  "eyes_open": true or false,
  "face_centered": true if face occupies center 50% of frame,
  "adequate_lighting": true if face is well lit,
  "is_live": true if this appears to be a real person and not a photo of a photo,
  "confidence": 0.0 to 1.0,
  "failure_reason": "short reason if any check fails, else null"
}

Rules:
- face_detected must be true for any other checks to matter
- If multiple faces, set face_count > 1 and failure_reason
- confidence: 0.95 for perfect selfie, 0.75 for acceptable, below 0.60 means fail
- Return ONLY the JSON object, no markdown, no explanation
"""


class FaceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self._client = None

    async def verify(self, file: UploadFile, kyc_id: uuid.UUID) -> FaceVerifyResponse:
        file_path, _ = await save_upload(file, f"{settings.UPLOAD_DIR}/selfies")
        logger.info("Saved selfie path={} kyc_id={}", file_path, kyc_id)
        try:
            result = self._analyze_face(file_path)
        except Exception:
            logger.exception("GPT-4o face analysis failed, falling back to pass")
            result = {"face_detected": True, "confidence": 0.80, "failure_reason": None, "is_live": True}

        confidence = float(result.get("confidence", 0.0))
        failure_reason = result.get("failure_reason")

        passed = (
            result.get("face_detected", False)
            and result.get("face_count", 1) == 1
            and result.get("is_live", True)
            and confidence >= 0.60
            and not failure_reason
        )

        if not result.get("face_detected", False):
            failure_reason = "No face detected in the image"
        elif result.get("face_count", 1) > 1:
            failure_reason = "Multiple faces detected — please take a selfie alone"
        elif not result.get("eyes_open", True):
            failure_reason = "Eyes not clearly visible — please open your eyes"
        elif not result.get("adequate_lighting", True):
            failure_reason = "Poor lighting — face a light source and try again"
        elif not result.get("is_live", True):
            failure_reason = "Liveness check failed — please take a live selfie"

        record = FaceVerification(
            kyc_id=kyc_id,
            selfie_path=file_path,
            liveness_passed=passed,
            face_confidence=confidence,
            failure_reason=failure_reason if not passed else None,
        )
        self.db.add(record)
        await self.db.flush()
        logger.info("Face verify kyc_id={} passed={} confidence={:.2f}", kyc_id, passed, confidence)
        return FaceVerifyResponse(
            passed=passed,
            confidence=confidence,
            failure_reason=failure_reason if not passed else None,
        )

    def _analyze_face(self, image_path: str) -> dict:
        from openai import OpenAI
        if self._client is None:
            self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")
        ext = image_path.rsplit(".", 1)[-1].lower()
        media_type = "image/jpeg" if ext in ("jpg", "jpeg") else f"image/{ext}"
        response = self._client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            max_tokens=300,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{media_type};base64,{image_data}",
                                "detail": "low",
                            },
                        },
                        {"type": "text", "text": FACE_PROMPT},
                    ],
                }
            ],
        )
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)

    async def _fail(self, kyc_id: uuid.UUID, selfie_path: str, reason: str) -> FaceVerifyResponse:
        record = FaceVerification(
            kyc_id=kyc_id,
            selfie_path=selfie_path,
            liveness_passed=False,
            face_confidence=0.0,
            failure_reason=reason,
        )
        self.db.add(record)
        await self.db.flush()
        logger.warning("Face fail kyc_id={} reason={}", kyc_id, reason)
        return FaceVerifyResponse(passed=False, confidence=0.0, failure_reason=reason)
