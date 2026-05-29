from typing import Optional
from pydantic import BaseModel, ConfigDict


class FaceVerifyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    passed: bool
    confidence: float
    failure_reason: Optional[str]
