from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.chat import ChatMessage
from app.core.config import settings
from app.core.exceptions import ChatServiceException

SYSTEM_PROMPT = (
    "You are a KYC onboarding assistant for Smart KYC, a digital identity verification platform "
    "used by Nepali fintech services. Help users understand: document requirements, verification "
    "status, rejection reasons, how to retake selfies, and onboarding steps. Be concise, friendly, "
    "and professional. Respond in the same language the user writes in. If KYC context is provided, "
    "use it to give specific answers."
)


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def ask(self, question: str, kyc_context: dict) -> str:
        if not question.strip():
            raise ChatServiceException("Question cannot be empty")
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            context_block = f"\nUser KYC context: {kyc_context}" if kyc_context else ""
            prompt = f"{SYSTEM_PROMPT}{context_block}\n\nUser: {question}"
            response = model.generate_content(prompt)
            answer = response.text.strip()
        except Exception as e:
            logger.exception("Gemini API call failed")
            raise ChatServiceException(str(e))
        await self._persist(question, answer)
        return answer

    async def _persist(self, question: str, answer: str) -> None:
        try:
            self.db.add(ChatMessage(role="user", content=question))
            self.db.add(ChatMessage(role="assistant", content=answer))
            await self.db.flush()
        except Exception:
            logger.warning("Failed to persist chat messages")
