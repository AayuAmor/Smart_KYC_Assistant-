import pytest

VALID_PAYLOAD = {
    "full_name": "Aayush Raut",
    "dob": "2006-02-14",
    "id_number": "12-01-76-00012",
    "address": "Bharatpur, Chitwan",
    "phone": "9812345678",
    "email": "aayush@example.com",
    "document_type": "citizenship",
}


@pytest.mark.asyncio
async def test_submit_kyc_success(client):
    r = await client.post("/api/v1/kyc/submit", json=VALID_PAYLOAD)
    assert r.status_code == 200
    data = r.json()
    assert "kyc_id" in data
    assert data["status"] == "submitted"


@pytest.mark.asyncio
async def test_submit_kyc_invalid_doc_type(client):
    payload = {**VALID_PAYLOAD, "document_type": "aadhaar"}
    r = await client.post("/api/v1/kyc/submit", json=payload)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_get_kyc_status(client):
    r = await client.post("/api/v1/kyc/submit", json=VALID_PAYLOAD)
    kyc_id = r.json()["kyc_id"]
    r2 = await client.get(f"/api/v1/kyc/status/{kyc_id}")
    assert r2.status_code == 200
    assert r2.json()["status"] == "submitted"


@pytest.mark.asyncio
async def test_get_kyc_not_found(client):
    r = await client.get("/api/v1/kyc/status/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404
    assert r.json()["error"] is True
