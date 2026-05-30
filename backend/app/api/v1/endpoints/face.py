import uuid

from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.api.deps import get_db
from app.schemas.face import FaceVerifyResponse
from app.services.face_service import FaceService
from app.core.exceptions import AppException

router = APIRouter(prefix="/face", tags=["Face Verification"])


@router.post("/verify", response_model=FaceVerifyResponse)
async def verify_face(
    file: UploadFile = File(...),
    kyc_id: uuid.UUID = Form(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        svc = FaceService(db)
        return await svc.verify(file, kyc_id)
    except AppException:
        raise
    except Exception:
        logger.exception("verify_face failed")
        raise
