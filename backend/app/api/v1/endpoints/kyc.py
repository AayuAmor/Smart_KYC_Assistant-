import asyncio
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger
from app.api.deps import get_db
from app.schemas.kyc import KYCSubmitRequest, KYCSubmitResponse, KYCStatusResponse
from app.services.kyc_service import KYCService, STATUS_STAGES
from app.core.exceptions import AppException

router = APIRouter(prefix="/kyc", tags=["KYC"])


@router.post("/submit", response_model=KYCSubmitResponse)
async def submit_kyc(
    payload: KYCSubmitRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    try:
        svc = KYCService(db)
        record = await svc.create_kyc(payload)
        background_tasks.add_task(_auto_progress_task, record.id)
        return KYCSubmitResponse(kyc_id=record.id, status=record.status, message="KYC submitted successfully")
    except AppException:
        raise
    except Exception:
        logger.exception("submit_kyc failed")
        raise


async def _auto_progress_task(kyc_id) -> None:
    from app.db.session import AsyncSessionLocal
    await asyncio.sleep(30)
    async with AsyncSessionLocal() as db:
        try:
            svc = KYCService(db)
            record = await svc.get_kyc(kyc_id)
            if record.status == "submitted":
                await svc.update_status(kyc_id, "under_review")
                await db.commit()
                logger.info("KYC {} auto-progressed to under_review", kyc_id)
        except Exception:
            logger.exception("auto_progress_task failed kyc_id={}", kyc_id)


@router.get("/status/{kyc_id}", response_model=KYCStatusResponse)
async def get_kyc_status(kyc_id, db: AsyncSession = Depends(get_db)):
    try:
        svc = KYCService(db)
        record = await svc.get_kyc(kyc_id)
        return KYCStatusResponse(
            kyc_id=record.id,
            status=record.status,
            stage=STATUS_STAGES.get(record.status, record.status),
            rejection_reason=record.rejection_reason,
            updated_at=record.updated_at,
            created_at=record.created_at,
        )
    except AppException:
        raise
    except Exception:
        logger.exception("get_kyc_status failed")
        raise
