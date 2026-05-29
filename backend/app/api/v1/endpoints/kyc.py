import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.schemas.kyc import KYCSubmitRequest, KYCSubmitResponse, KYCStatusResponse
from app.services.kyc_service import KYCService, STATUS_STAGES
from app.core.exceptions import AppException
from loguru import logger

router = APIRouter(prefix="/kyc", tags=["KYC"])


@router.post("/submit", response_model=KYCSubmitResponse)
async def submit_kyc(payload: KYCSubmitRequest, db: AsyncSession = Depends(get_db)):
    try:
        svc = KYCService(db)
        record = await svc.create_kyc(payload)
        return KYCSubmitResponse(kyc_id=record.id, status=record.status, message="KYC submitted successfully")
    except AppException:
        raise
    except Exception:
        logger.exception("submit_kyc failed")
        raise


@router.get("/status/{kyc_id}", response_model=KYCStatusResponse)
async def get_kyc_status(kyc_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    try:
        svc = KYCService(db)
        record = await svc.get_kyc(kyc_id)
        return KYCStatusResponse(
            kyc_id=record.id,
            status=record.status,
            stage=STATUS_STAGES.get(record.status, record.status),
            rejection_reason=record.rejection_reason,
            updated_at=record.updated_at,
        )
    except AppException:
        raise
    except Exception:
        logger.exception("get_kyc_status failed")
        raise
