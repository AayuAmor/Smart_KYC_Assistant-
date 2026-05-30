import pytest
from unittest.mock import patch, MagicMock


@pytest.mark.asyncio
async def test_chat_empty_question(client):
    r = await client.post("/api/v1/chat/ask", json={"question": "", "kyc_context": {}})
    assert r.status_code in (422, 502)


@pytest.mark.asyncio
async def test_chat_returns_answer(client):
    mock_response = MagicMock()
    mock_response.text = "You need to upload citizenship front and back."
    with patch("google.generativeai.GenerativeModel.generate_content", return_value=mock_response):
        r = await client.post("/api/v1/chat/ask", json={"question": "What documents do I need?", "kyc_context": {}})
    assert r.status_code == 200
    assert len(r.json()["answer"]) > 0
