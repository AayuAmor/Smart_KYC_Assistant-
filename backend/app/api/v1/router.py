from fastapi import APIRouter
from app.api.v1.endpoints import kyc, chat, face, ocr

router = APIRouter()
router.include_router(kyc.router)
router.include_router(chat.router)
router.include_router(face.router)
router.include_router(ocr.router)
