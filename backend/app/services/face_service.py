import uuid
from loguru import logger
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import AppException
from app.db.models.face import FaceVerification
from app.schemas.face import FaceVerifyResponse
from app.utils.file_handler import save_upload


class FaceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def verify(self, file: UploadFile, kyc_id: uuid.UUID) -> FaceVerifyResponse:
        file_path, _ = await save_upload(file, f"{settings.UPLOAD_DIR}/selfies")
        try:
            import cv2
            import numpy as np
            img = cv2.imread(file_path)
            if img is None:
                return await self._fail(kyc_id, file_path, "Could not read image")
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            h, w = gray.shape
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
            eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))
            if len(faces) == 0:
                return await self._fail(kyc_id, file_path, "No face detected in the image")
            if len(faces) > 1:
                return await self._fail(kyc_id, file_path, "Multiple faces detected")
            fx, fy, fw, fh = faces[0]
            cx, cy = fx + fw // 2, fy + fh // 2
            if abs(cx - w // 2) > w * 0.25 or abs(cy - h // 2) > h * 0.25:
                return await self._fail(kyc_id, file_path, "Face not centered in frame")
            face_area_ratio = (fw * fh) / (w * h)
            if face_area_ratio < 0.05:
                return await self._fail(kyc_id, file_path, "Face too small — move closer to camera")
            face_roi = gray[fy:fy + fh, fx:fx + fw]
            eyes = eye_cascade.detectMultiScale(face_roi, scaleFactor=1.1, minNeighbors=5)
            if len(eyes) < 2:
                return await self._fail(kyc_id, file_path, "Eyes not clearly visible — open eyes fully")
            brightness = float(np.mean(gray[fy:fy + fh, fx:fx + fw]))
            if brightness < 60:
                return await self._fail(kyc_id, file_path, "Image too dark — improve lighting")
            if brightness > 220:
                return await self._fail(kyc_id, file_path, "Image overexposed — reduce direct light")
            confidence = round(min(1.0, face_area_ratio * 4 + 0.4), 3)
            record = FaceVerification(kyc_id=kyc_id, selfie_path=file_path, liveness_passed=True, face_confidence=confidence, failure_reason=None)
            self.db.add(record)
            await self.db.flush()
            logger.info("Face verified kyc_id={} confidence={}", kyc_id, confidence)
            return FaceVerifyResponse(passed=True, confidence=confidence, failure_reason=None)
        except AppException:
            raise
        except Exception:
            logger.exception("Face verification error")
            return await self._fail(kyc_id, file_path, "Verification processing error")

    async def _fail(self, kyc_id: uuid.UUID, selfie_path: str, reason: str) -> FaceVerifyResponse:
        record = FaceVerification(kyc_id=kyc_id, selfie_path=selfie_path, liveness_passed=False, face_confidence=0.0, failure_reason=reason)
        self.db.add(record)
        await self.db.flush()
        logger.warning("Face verification failed kyc_id={} reason={}", kyc_id, reason)
        return FaceVerifyResponse(passed=False, confidence=0.0, failure_reason=reason)
