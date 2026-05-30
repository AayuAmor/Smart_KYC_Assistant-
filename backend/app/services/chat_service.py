from loguru import logger
from openai import OpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.chat import ChatMessage
from app.core.config import settings
from app.core.exceptions import ChatServiceException

SYSTEM_PROMPT = """You are a KYC onboarding assistant for Smart KYC, used by Nepali fintech services.

Your job:
- Help users understand their KYC status, what went wrong, and what to do next
- Explain document requirements for Nepal: citizenship (front+back), passport (front+back), driving license (front), voter ID (front)
- Guide users through the onboarding steps
- If the user was rejected, explain the specific reason and how to fix it
- Be concise, warm, and professional
- Respond in the same language the user writes in (Nepali or English)
- Never make up information — if you don't know, say so

When KYC context is provided, use it to give specific personalized answers.
If status is 'rejected', focus on the rejection reason and recovery steps.
If status is 'under_review', reassure and give expected timelines (1-3 business days).
If status is 'approved', congratulate and explain next steps.
"""


def _build_context_block(kyc_context: dict) -> str:
    if not kyc_context:
        return ""
    parts = []
    if kyc_context.get("kyc_id"):
        parts.append(f"KYC ID: {kyc_context['kyc_id']}")
    if kyc_context.get("status"):
        parts.append(f"Status: {kyc_context['status']}")
    if kyc_context.get("rejection_reason"):
        parts.append(f"Rejection reason: {kyc_context['rejection_reason']}")
    if kyc_context.get("document_type"):
        parts.append(f"Document type: {kyc_context['document_type']}")
    if kyc_context.get("full_name"):
        parts.append(f"User name: {kyc_context['full_name']}")
    return "\n\nUser KYC context:\n" + "\n".join(parts) if parts else ""


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def ask(self, question: str, kyc_context: dict) -> str:
        if not question.strip():
            raise ChatServiceException("Question cannot be empty")
        history = await self._get_recent_history(kyc_context.get("kyc_id"))
        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            context_block = _build_context_block(kyc_context)
            messages = [{"role": "system", "content": SYSTEM_PROMPT + context_block}]
            for msg in history:
                messages.append({"role": msg.role, "content": msg.content})
            messages.append({"role": "user", "content": question})
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                max_tokens=500,
                temperature=0.7,
            )
            answer = response.choices[0].message.content.strip()
        except Exception as e:
            logger.exception("OpenAI chat API call failed")
            raise ChatServiceException(str(e))
        await self._persist(question, answer, kyc_context.get("kyc_id"))
        return answer

    async def _get_recent_history(self, kyc_id) -> list:
        if not kyc_id:
            return []
        try:
            from uuid import UUID
            uid = UUID(str(kyc_id))
            result = await self.db.execute(
                select(ChatMessage)
                .where(ChatMessage.kyc_id == uid)
                .order_by(ChatMessage.created_at.desc())
                .limit(10)
            )
            msgs = result.scalars().all()
            return list(reversed(msgs))
        except Exception:
            return []

    async def _persist(self, question: str, answer: str, kyc_id=None) -> None:
        try:
            from uuid import UUID
            uid = UUID(str(kyc_id)) if kyc_id else None
            self.db.add(ChatMessage(role="user", content=question, kyc_id=uid))
            self.db.add(ChatMessage(role="assistant", content=answer, kyc_id=uid))
            await self.db.flush()
        except Exception:
            logger.warning("Failed to persist chat messages")
