from pydantic import BaseModel, ConfigDict


class ChatRequest(BaseModel):
    question: str
    kyc_context: dict = {}


class ChatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    answer: str
