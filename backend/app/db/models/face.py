import uuid
from typing import Optional
from sqlalchemy import String, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base, UUIDMixin, TimestampMixin


class FaceVerification(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "face_verifications"

    kyc_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("kyc_records.id"), nullable=False)
    selfie_path: Mapped[str] = mapped_column(String(500), nullable=False)
    liveness_passed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    face_confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    failure_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
