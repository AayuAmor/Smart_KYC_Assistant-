import uuid
from typing import Optional
from loguru import logger
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import OCRFailedException
from app.db.models.document import Document
from app.ml.ocr_engine import OCREngine
from app.schemas.ocr import OCRUploadResponse
from app.utils.file_handler import save_upload

_ocr_engine = OCREngine()


class OCRService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def process_document(
        self,
        file: UploadFile,
        side: str,
        kyc_id: uuid.UUID | None = None,
        back_file: Optional[UploadFile] = None,
    ) -> OCRUploadResponse:
        file_path, file_size = await save_upload(file, f"{settings.UPLOAD_DIR}/documents")
        logger.info("Saved front path={} size={}", file_path, file_size)

        back_path = None
        if back_file and back_file.filename:
            back_path, _ = await save_upload(back_file, f"{settings.UPLOAD_DIR}/documents")
            logger.info("Saved back path={}", back_path)

        try:
            result = _ocr_engine.extract_fields_from_image(file_path, back_path=back_path)
        except Exception:
            logger.exception("GPT-4o Vision OCR failed")
            raise OCRFailedException("Document analysis failed")

        doc_type = result.get("doc_type", "unknown")
        confidence = float(result.get("confidence", 0.0))
        full_name = result.get("full_name")
        dob = result.get("dob")
        id_number = result.get("id_number")
        permanent_province = result.get("permanent_province")
        permanent_district = result.get("permanent_district")
        permanent_municipality = result.get("permanent_municipality")
        permanent_ward = result.get("permanent_ward")
        permanent_tole = result.get("permanent_tole")
        issued_district = result.get("issued_district")
        issued_date = result.get("issued_date")

        address_parts = [p for p in [permanent_tole, permanent_municipality, permanent_district, permanent_province] if p]
        address = ", ".join(address_parts) if address_parts else None

        field_scores = {
            k: confidence
            for k, v in {
                "full_name": full_name,
                "dob": dob,
                "id_number": id_number,
                "permanent_province": permanent_province,
                "permanent_district": permanent_district,
                "permanent_municipality": permanent_municipality,
            }.items() if v
        }

        doc_id = None
        if kyc_id:
            doc_record = Document(
                kyc_id=kyc_id,
                side=side,
                file_path=file_path,
                original_filename=file.filename or "upload",
                mime_type=file.content_type or "image/jpeg",
                file_size_bytes=file_size,
                ocr_raw_text=str(result),
                detected_doc_type=doc_type,
                classifier_confidence=confidence,
            )
            self.db.add(doc_record)
            await self.db.flush()
            await self.db.refresh(doc_record)
            doc_id = doc_record.id
            logger.info(
                "OCR complete doc_id={} doc_type={} confidence={:.2f}",
                doc_id, doc_type, confidence,
            )
        else:
            logger.info(
                "OCR complete doc_id=<not persisted> doc_type={} confidence={:.2f}",
                doc_type, confidence,
            )

        return OCRUploadResponse(
            document_id=doc_id or uuid.uuid4(),
            detected_doc_type=doc_type,
            classifier_confidence=confidence,
            ocr_confidence=confidence,
            full_name=full_name,
            dob=dob,
            id_number=id_number,
            address=address,
            issued_district=issued_district,
            issued_date=issued_date,
            permanent_province=permanent_province,
            permanent_district=permanent_district,
            permanent_municipality=permanent_municipality,
            permanent_ward=permanent_ward,
            permanent_tole=permanent_tole,
            field_scores=field_scores,
            overall_confidence=confidence,
            side=side,
        )
