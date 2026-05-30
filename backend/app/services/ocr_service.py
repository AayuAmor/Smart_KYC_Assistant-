import re
import uuid
from loguru import logger
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import OCRFailedException
from app.db.models.document import Document
from app.ml.preprocessor import preprocess_for_ocr
from app.ml.ocr_engine import OCREngine
from app.ml.classifier import DocumentClassifier
from app.ml.confidence import score_extracted_fields, compute_overall_confidence
from app.schemas.ocr import OCRUploadResponse
from app.utils.file_handler import save_upload

_ocr_engine = OCREngine()
_classifier = DocumentClassifier()

FIELD_EXTRACTORS: dict[str, dict[str, list[str]]] = {
    "citizenship": {
        "full_name":       [r"(?:name|नाम)[:\s]+([A-Za-z\s]{4,40})", r"^([A-Z][a-z]+ [A-Z][a-z]+)"],
        "dob":             [r"(?:born|birth|जन्म)[:\s]*(\d{4}[-/]\d{2}[-/]\d{2})", r"(\d{4}[-/]\d{2}[-/]\d{2})"],
        "id_number":       [r"(\d{2}-\d{2}-\d{2}-\d{5})"],
        "issued_district": [r"(?:issued|district|जिल्ला)[:\s]+([A-Za-z\s]{3,30})"],
        "issued_date":     [r"(?:issued on|date)[:\s]*(\d{4}[-/]\d{2}[-/]\d{2})"],
        "address":         [r"(?:address|ठेगाना)[:\s]+([A-Za-z,\s]{4,60})"],
    },
    "passport": {
        "full_name":       [r"(?:given names?|surname)[:\s]+([A-Z\s]{4,40})", r"^([A-Z]+ [A-Z]+)"],
        "dob":             [r"(?:date of birth|born)[:\s]*(\d{4}[-/]\d{2}[-/]\d{2})"],
        "id_number":       [r"([A-Z]{2}\d{7})"],
        "address":         [r"(?:nationality|country)[:\s]+([A-Za-z\s]{3,30})"],
        "issued_date":     [r"(?:date of issue|issued)[:\s]*(\d{4}[-/]\d{2}[-/]\d{2})"],
        "issued_district": [],
    },
    "license": {
        "full_name":       [r"(?:name|holder)[:\s]+([A-Za-z\s]{4,40})"],
        "dob":             [r"(?:dob|birth)[:\s]*(\d{4}[-/]\d{2}[-/]\d{2})"],
        "id_number":       [r"(?:license no|licence no)[:\s]*([A-Z0-9\-]+)", r"(\d{9,})"],
        "address":         [r"(?:address)[:\s]+([A-Za-z,\s]{4,60})"],
        "issued_date":     [r"(?:valid from|issued)[:\s]*(\d{4}[-/]\d{2}[-/]\d{2})"],
        "issued_district": [],
    },
    "voter_id": {
        "full_name":       [r"(?:name|नाम)[:\s]+([A-Za-z\s]{4,40})"],
        "dob":             [r"(\d{4}[-/]\d{2}[-/]\d{2})"],
        "id_number":       [r"(?:voter id|id no)[:\s]*(\d+)", r"(\d{7,})"],
        "address":         [r"(?:ward|municipality|गाउँ)[:\s]+([A-Za-z0-9,\s]{4,60})"],
        "issued_date":     [],
        "issued_district": [],
    },
}

DEFAULT_EXTRACTORS = {
    "full_name":       [r"(?:name)[:\s]+([A-Za-z\s]{4,40})"],
    "dob":             [r"(\d{4}[-/]\d{2}[-/]\d{2})"],
    "id_number":       [r"(\d{2}-\d{2}-\d{2}-\d{5})", r"([A-Z]{2}\d{7})", r"(\d{9,})"],
    "address":         [r"(?:address)[:\s]+([A-Za-z,\s]{4,60})"],
    "issued_district": [],
    "issued_date":     [r"(\d{4}[-/]\d{2}[-/]\d{2})"],
}


class OCRService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def process_document(self, file: UploadFile, side: str, kyc_id: uuid.UUID | None = None) -> OCRUploadResponse:
        file_path, file_size = await save_upload(file, f"{settings.UPLOAD_DIR}/documents")
        logger.info("Saved upload path={} size={}", file_path, file_size)
        try:
            image = preprocess_for_ocr(file_path)
        except Exception:
            logger.exception("Preprocessing failed path={}", file_path)
            raise OCRFailedException("Image preprocessing failed")
        try:
            raw_text, ocr_confidence = _ocr_engine.extract_text(image)
        except Exception:
            logger.exception("OCR extraction failed")
            raise OCRFailedException("OCR text extraction failed")
        import cv2
        original_image = cv2.imread(file_path)
        doc_type, classifier_confidence = _classifier.classify(raw_text, original_image)
        extractors = FIELD_EXTRACTORS.get(doc_type, DEFAULT_EXTRACTORS)
        fields = _extract_fields(raw_text, extractors)
        field_scores = score_extracted_fields(fields)
        overall = compute_overall_confidence(field_scores)
        doc_record = Document(
            kyc_id=kyc_id or uuid.uuid4(),
            side=side,
            file_path=file_path,
            original_filename=file.filename or "upload",
            mime_type=file.content_type or "image/jpeg",
            file_size_bytes=file_size,
            ocr_raw_text=raw_text,
            detected_doc_type=doc_type,
            classifier_confidence=classifier_confidence,
        )
        self.db.add(doc_record)
        await self.db.flush()
        await self.db.refresh(doc_record)
        logger.info("OCR complete doc_id={} doc_type={} ocr_conf={:.2f} overall={:.2f}", doc_record.id, doc_type, ocr_confidence, overall)
        return OCRUploadResponse(
            document_id=doc_record.id,
            detected_doc_type=doc_type,
            classifier_confidence=classifier_confidence,
            ocr_confidence=ocr_confidence,
            full_name=fields.get("full_name"),
            dob=fields.get("dob"),
            id_number=fields.get("id_number"),
            address=fields.get("address"),
            issued_district=fields.get("issued_district"),
            issued_date=fields.get("issued_date"),
            field_scores=field_scores,
            overall_confidence=overall,
            side=side,
        )


def _extract_fields(text: str, extractors: dict[str, list[str]]) -> dict[str, str | None]:
    results: dict[str, str | None] = {}
    for field, patterns in extractors.items():
        value = None
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                value = match.group(1).strip()
                break
        results[field] = value
    return results
