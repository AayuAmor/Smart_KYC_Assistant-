from loguru import logger
from openai import OpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.chat import ChatMessage
from app.core.config import settings
from app.core.exceptions import ChatServiceException

SYSTEM_PROMPT = """You are a KYC verification assistant for Smart KYC, a Nepal-based digital identity platform.

You have access to the user's real KYC status. Always answer based on their ACTUAL status, not assumptions.

Status meanings:
- pending: User has not submitted KYC yet. Ask them to upload their document.
- submitted: KYC submitted and awaiting review. Review takes 1-3 business days.
- under_review: KYC is actively being reviewed by the team.
- approved: KYC is fully verified. User can proceed with financial services.
- rejected: KYC was rejected. Tell them the exact rejection reason and how to fix it.

Rules:
- Always check the context block for the user's actual status before answering
- If status is rejected, lead with the rejection reason and clear fix steps
- If status is pending and user asks why rejected, tell them their KYC is still pending, not rejected
- If status is approved, congratulate them
- Be specific, concise, and helpful
- Respond in the same language the user writes in
- Never make up information
"""


def _build_context_block(kyc_context: dict) -> str:
    if not kyc_context:
        return "\n\nUser KYC context: No KYC submitted yet."
    status = kyc_context.get("status", "unknown")
    parts = [f"\n\nUser KYC context:"]
    parts.append(f"Current status: {status.upper()}")
    if kyc_context.get("kyc_id"):
        parts.append(f"KYC ID: {kyc_context['kyc_id']}")
    if kyc_context.get("full_name"):
        parts.append(f"Name: {kyc_context['full_name']}")
    if kyc_context.get("document_type"):
        parts.append(f"Document type: {kyc_context['document_type']}")
    if status == "rejected" and kyc_context.get("rejection_reason"):
        parts.append(f"Rejection reason: {kyc_context['rejection_reason']}")
    elif status == "rejected":
        parts.append("Rejection reason: not specified")
    return "\n".join(parts)


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
