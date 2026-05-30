import uuid
from typing import Optional
from sqlalchemy import String, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base, UUIDMixin, TimestampMixin


class Document(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "documents"

    kyc_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("kyc_records.id"), nullable=False)
    side: Mapped[str] = mapped_column(String(10), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    ocr_raw_text: Mapped[Optional[str]] = mapped_column(nullable=True)
    detected_doc_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    classifier_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
