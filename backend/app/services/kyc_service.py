import uuid
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.kyc import KYCRecord
from app.schemas.kyc import KYCSubmitRequest
from app.core.exceptions import KYCNotFoundException

STATUS_STAGES = {
    "submitted": "Document received",
    "under_review": "Manual review in progress",
    "approved": "Identity verified",
    "rejected": "Verification failed",
}


class KYCService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_kyc(self, payload: KYCSubmitRequest) -> KYCRecord:
        record = KYCRecord(
            full_name=payload.full_name,
            dob=payload.dob,
            id_number=payload.id_number,
            address=payload.address,
            phone=payload.phone,
            email=payload.email or "",
            document_type=payload.document_type,
            status="submitted",
        )
        self.db.add(record)
        await self.db.flush()
        await self.db.refresh(record)
        logger.info("KYC record created id={}", record.id)
        return record

    async def get_kyc(self, kyc_id: uuid.UUID) -> KYCRecord:
        result = await self.db.execute(select(KYCRecord).where(KYCRecord.id == kyc_id))
        record = result.scalar_one_or_none()
        if not record:
            raise KYCNotFoundException(str(kyc_id))
        return record

    async def update_status(self, kyc_id: uuid.UUID, status: str, reason: str | None = None) -> KYCRecord:
        record = await self.get_kyc(kyc_id)
        record.status = status
        if reason:
            record.rejection_reason = reason
        await self.db.flush()
        await self.db.refresh(record)
        logger.info("KYC {} status updated to {}", kyc_id, status)
        return record
