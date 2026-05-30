import uuid
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class KYCSubmitRequest(BaseModel):
    full_name: str
    dob: str
    id_number: str
    address: str
    phone: str
    email: EmailStr
    document_type: Literal["citizenship", "passport", "license", "voter_id"]


class KYCSubmitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    kyc_id: uuid.UUID
    status: str
    message: str


class KYCStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    kyc_id: uuid.UUID
    status: str
    stage: str
    rejection_reason: Optional[str]
    updated_at: datetime
