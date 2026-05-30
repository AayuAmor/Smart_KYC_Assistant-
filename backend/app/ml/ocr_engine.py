import base64
import json
from pathlib import Path
from loguru import logger
from openai import OpenAI
from app.core.config import settings

PROVINCES = [
    "Koshi Province", "Madhesh Province", "Bagmati Province",
    "Gandaki Province", "Lumbini Province", "Karnali Province",
    "Sudurpashchim Province",
]

DISTRICTS = [
    "Bhojpur","Dhankuta","Ilam","Jhapa","Khotang","Morang","Okhaldhunga",
    "Panchthar","Sankhuwasabha","Solukhumbu","Sunsari","Taplejung","Tehrathum","Udayapur",
    "Bara","Dhanusha","Mahottari","Parsa","Rautahat","Saptari","Sarlahi","Siraha",
    "Bhaktapur","Chitwan","Dhading","Dolakha","Kathmandu","Kavrepalanchok","Lalitpur",
    "Makwanpur","Nuwakot","Ramechhap","Rasuwa","Sindhuli","Sindhupalchok",
    "Baglung","Gorkha","Kaski","Lamjung","Manang","Mustang","Myagdi","Nawalpur",
    "Parbat","Syangja","Tanahun",
    "Arghakhanchi","Banke","Bardiya","Dang","Gulmi","Kapilvastu","Nawalparasi West",
    "Palpa","Pyuthan","Rolpa","Rukum East","Rupandehi",
    "Dailekh","Dolpa","Humla","Jajarkot","Jumla","Kalikot","Mugu","Rukum West","Salyan","Surkhet",
    "Achham","Baitadi","Bajhang","Bajura","Dadeldhura","Darchula","Doti","Kailali","Kanchanpur",
]

EXTRACTION_PROMPT = f"""You are a KYC document field extraction engine for Nepal.
Analyze this document image and extract fields into a JSON object.

Return ONLY valid JSON with exactly these keys (use null if not found):
{{
  "doc_type": "citizenship" | "passport" | "license" | "voter_id" | "unknown",
  "full_name": "Full name in English, transliterate if Devanagari",
  "dob": "YYYY-MM-DD format or null",
  "id_number": "Document number or null",
  "permanent_province": "Exact match from list or null",
  "permanent_district": "Exact match from list or null",
  "permanent_municipality": "Municipality or Rural Municipality name or null",
  "permanent_ward": "Ward number as string or null",
  "permanent_tole": "Tole / street name or null",
  "issued_district": "District where document was issued or null",
  "issued_date": "YYYY-MM-DD format or null",
  "confidence": 0.0 to 1.0
}}

Rules:
- For permanent_province use ONLY one of these exact values: {json.dumps(PROVINCES)}
- For permanent_district use ONLY one of these exact values: {json.dumps(DISTRICTS)}
- For permanent_municipality include the full suffix: "Municipality", "Metropolitan City", "Sub-Metropolitan City", or "Rural Municipality"
- For Nepali citizenship: id_number format is XX-XX-XX-XXXXX
- For passport: id_number is 2 letters + 7 digits
- Convert all dates to YYYY-MM-DD
- confidence: 0.95 for clear sharp image, 0.7 for readable, 0.4 for blurry
- Return ONLY the JSON object, no markdown fences, no explanation
"""


class OCREngine:
    def __init__(self):
        self._client = None

    def extract_fields_from_image(self, image_path: str) -> dict:
        client = self._get_client()
        image_data = self._encode_image(image_path)
        ext = Path(image_path).suffix.lower().lstrip(".")
        media_type = "image/jpeg" if ext in ("jpg", "jpeg") else f"image/{ext}"
        try:
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                max_tokens=600,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{media_type};base64,{image_data}",
                                    "detail": "high",
                                },
                            },
                            {"type": "text", "text": EXTRACTION_PROMPT},
                        ],
                    }
                ],
            )
            raw = response.choices[0].message.content.strip()
            raw = raw.replace("```json", "").replace("```", "").strip()
            result = json.loads(raw)
            logger.info(
                "GPT-4o extraction doc_type={} confidence={}",
                result.get("doc_type"), result.get("confidence"),
            )
            return result
        except json.JSONDecodeError as e:
            logger.error("GPT-4o returned invalid JSON: {}", e)
            return {"doc_type": "unknown", "confidence": 0.0}
        except Exception:
            logger.exception("GPT-4o Vision extraction failed")
            return {"doc_type": "unknown", "confidence": 0.0}

    def _encode_image(self, image_path: str) -> str:
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    def _get_client(self) -> OpenAI:
        if self._client is None:
            self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client
