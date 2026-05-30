from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.api.deps import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService
from app.core.exceptions import AppException

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/ask", response_model=ChatResponse)
async def ask_chat(payload: ChatRequest, db: AsyncSession = Depends(get_db)):
    try:
        svc = ChatService(db)
        answer = await svc.ask(payload.question, payload.kyc_context)
        return ChatResponse(answer=answer)
    except AppException:
        raise
    except Exception:
        logger.exception("ask_chat failed")
        raise
