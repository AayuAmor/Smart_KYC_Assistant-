import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict


class OCRUploadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    document_id: uuid.UUID
    detected_doc_type: str
    classifier_confidence: float
    ocr_confidence: float
    full_name: Optional[str] = None
    dob: Optional[str] = None
    id_number: Optional[str] = None
    address: Optional[str] = None
    issued_district: Optional[str] = None
    issued_date: Optional[str] = None
    field_scores: dict[str, float] = {}
    overall_confidence: float
    side: str
