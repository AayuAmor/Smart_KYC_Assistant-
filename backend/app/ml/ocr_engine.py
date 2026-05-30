import base64
import json
from pathlib import Path
from loguru import logger
from openai import OpenAI
from app.core.config import settings

PROVINCES = [
    "Koshi Province","Madhesh Province","Bagmati Province","Gandaki Province",
    "Lumbini Province","Karnali Province","Sudurpashchim Province",
]

DISTRICTS = [
    "Bhojpur","Dhankuta","Ilam","Jhapa","Khotang","Morang","Okhaldhunga","Panchthar",
    "Sankhuwasabha","Solukhumbu","Sunsari","Taplejung","Tehrathum","Udayapur",
    "Bara","Dhanusha","Mahottari","Parsa","Rautahat","Saptari","Sarlahi","Siraha",
    "Bhaktapur","Chitwan","Dhading","Dolakha","Kathmandu","Kavrepalanchok","Lalitpur",
    "Makwanpur","Nuwakot","Ramechhap","Rasuwa","Sindhuli","Sindhupalchok",
    "Baglung","Gorkha","Kaski","Lamjung","Manang","Mustang","Myagdi","Nawalpur",
    "Parbat","Syangja","Tanahun","Arghakhanchi","Banke","Bardiya","Dang","Gulmi",
    "Kapilvastu","Nawalparasi West","Palpa","Pyuthan","Rolpa","Rukum East","Rupandehi",
    "Dailekh","Dolpa","Humla","Jajarkot","Jumla","Kalikot","Mugu","Rukum West","Salyan","Surkhet",
    "Achham","Baitadi","Bajhang","Bajura","Dadeldhura","Darchula","Doti","Kailali","Kanchanpur",
]

SINGLE_PROMPT = f"""You are a KYC document OCR engine for Nepal.
Analyze this document image and extract all visible fields.

Return ONLY valid JSON with exactly these keys (null if not found):
{{
  "doc_type": "citizenship" | "passport" | "license" | "voter_id" | "unknown",
  "full_name": "Read the ENGLISH/ROMAN script name directly. Do NOT transliterate from Devanagari.",
  "dob": "YYYY-MM-DD or null",
  "id_number": "Document number or null",
  "gender": "Male | Female | Other | null",
  "permanent_province": "Exact value from list or null",
  "permanent_district": "Exact value from list or null",
  "permanent_municipality": "Full name with Municipality/Rural Municipality suffix or null",
  "permanent_ward": "Ward number as string or null",
  "permanent_tole": "Tole or street name or null",
  "issued_district": "District where document was issued or null",
  "issued_date": "YYYY-MM-DD or null",
  "confidence": 0.0 to 1.0
}}

Rules:
- permanent_province must be one of: {json.dumps(PROVINCES)}
- permanent_district must be one of: {json.dumps(DISTRICTS)}
- id_number for citizenship: XX-XX-XX-XXXXX
- id_number for passport: 2 letters + 7 digits
- All dates YYYY-MM-DD
- gender: read from the document. Nepali citizenship cards say "लिङ्ग" — पुरुष means Male, महिला means Female. Return exactly "Male", "Female", or "Other".
- confidence: 0.95 clear, 0.70 readable, 0.40 blurry
- Return ONLY the JSON object, no markdown, no explanation
"""

DUAL_PROMPT = f"""You are a KYC document OCR engine for Nepal.
You are given TWO images of the same document: the FRONT side and the BACK side.

The BACK side of Nepali citizenship cards contains the person's name, address, and details in ENGLISH.
The FRONT side contains the same information in Devanagari script.

IMPORTANT: Read the name from the BACK side (English) — it is more accurate.
Use both sides together to extract all fields.

Return ONLY valid JSON with exactly these keys (null if not found):
{{
  "doc_type": "citizenship" | "passport" | "license" | "voter_id" | "unknown",
  "full_name": "Read directly from BACK side English text. Do NOT guess or transliterate.",
  "dob": "YYYY-MM-DD or null",
  "id_number": "Document number or null",
  "gender": "Male | Female | Other | null",
  "permanent_province": "Exact value from list or null",
  "permanent_district": "Exact value from list or null",
  "permanent_municipality": "Full name with Municipality/Rural Municipality suffix or null",
  "permanent_ward": "Ward number as string or null",
  "permanent_tole": "Tole or street name or null",
  "issued_district": "District where document was issued or null",
  "issued_date": "YYYY-MM-DD or null",
  "confidence": 0.0 to 1.0
}}

Rules:
- permanent_province must be one of: {json.dumps(PROVINCES)}
- permanent_district must be one of: {json.dumps(DISTRICTS)}
- id_number for citizenship: XX-XX-XX-XXXXX
- All dates YYYY-MM-DD
- gender: read from the document. Nepali citizenship cards say "लिङ्ग" — पुरुष means Male, महिला means Female. Return exactly "Male", "Female", or "Other".
- confidence: 0.95 clear, 0.70 readable, 0.40 blurry
- Return ONLY the JSON object, no markdown, no explanation
"""


class OCREngine:
    def __init__(self):
        self._client = None

    def extract_fields_from_image(self, image_path: str, back_path: str | None = None) -> dict:
        client = self._get_client()
        content = []

        front_data = self._encode_image(image_path)
        front_ext = Path(image_path).suffix.lower().lstrip(".")
        front_mime = "image/jpeg" if front_ext in ("jpg", "jpeg") else f"image/{front_ext}"
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:{front_mime};base64,{front_data}",
                "detail": "high",
            },
        })

        if back_path:
            back_data = self._encode_image(back_path)
            back_ext = Path(back_path).suffix.lower().lstrip(".")
            back_mime = "image/jpeg" if back_ext in ("jpg", "jpeg") else f"image/{back_ext}"
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{back_mime};base64,{back_data}",
                    "detail": "high",
                },
            })
            content.append({"type": "text", "text": DUAL_PROMPT})
            logger.info("Sending both sides to GPT-4o Vision")
        else:
            content.append({"type": "text", "text": SINGLE_PROMPT})
            logger.info("Sending single side to GPT-4o Vision")

        try:
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                max_tokens=600,
                messages=[{"role": "user", "content": content}],
            )
            raw = response.choices[0].message.content.strip()
            raw = raw.replace("```json", "").replace("```", "").strip()
            result = json.loads(raw)
            logger.info(
                "GPT-4o extraction doc_type={} confidence={} name={}",
                result.get("doc_type"), result.get("confidence"), result.get("full_name"),
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
