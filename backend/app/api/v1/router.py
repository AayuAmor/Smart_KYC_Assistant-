from fastapi import APIRouter
from app.api.v1.endpoints import kyc, chat, face

router = APIRouter()
router.include_router(kyc.router)
router.include_router(chat.router)
router.include_router(face.router)
