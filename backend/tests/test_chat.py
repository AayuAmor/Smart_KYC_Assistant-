import pytest
from unittest.mock import patch, MagicMock


@pytest.mark.asyncio
async def test_chat_empty_question(client):
    r = await client.post("/api/v1/chat/ask", json={"question": "", "kyc_context": {}})
    assert r.status_code in (422, 502)


@pytest.mark.asyncio
async def test_chat_returns_answer(client):
    mock_choice = MagicMock()
    mock_choice.message.content = "You need to upload citizenship front and back."
    mock_completion = MagicMock()
    mock_completion.choices = [mock_choice]
    with patch("app.services.chat_service.OpenAI") as mock_openai_cls:
        mock_openai_cls.return_value.chat.completions.create.return_value = mock_completion
        r = await client.post("/api/v1/chat/ask", json={"question": "What documents do I need?", "kyc_context": {}})
    assert r.status_code == 200
    assert len(r.json()["answer"]) > 0
