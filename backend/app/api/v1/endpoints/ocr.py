from fastapi import APIRouter, Depends, UploadFile, File, Form
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.schemas.ocr import OCRUploadResponse
from app.services.ocr_service import OCRService
from app.core.exceptions import AppException
from loguru import logger

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post("/upload", response_model=OCRUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    back_file: Optional[UploadFile] = File(default=None),
    side: str = Form(default="front"),
    db: AsyncSession = Depends(get_db),
):
    try:
        svc = OCRService(db)
        return await svc.process_document(file, side, back_file=back_file)
    except AppException:
        raise
    except Exception:
        logger.exception("OCR upload failed")
        raise
