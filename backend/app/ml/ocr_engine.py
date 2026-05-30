import numpy as np
import pytesseract
from loguru import logger
from app.core.config import settings


class OCREngine:
    def __init__(self):
        self._reader = None
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

    def extract_text(self, image: np.ndarray) -> tuple[str, float]:
        try:
            text, confidence = self._run_easyocr(image)
            if confidence >= settings.OCR_CONFIDENCE_THRESHOLD:
                logger.info("EasyOCR succeeded confidence={:.2f}", confidence)
                return text, confidence
            logger.warning("EasyOCR low confidence={:.2f}, falling back to Tesseract", confidence)
        except Exception:
            logger.exception("EasyOCR failed, falling back to Tesseract")
        return self._run_tesseract(image)

    def _run_easyocr(self, image: np.ndarray) -> tuple[str, float]:
        reader = self._get_reader()
        results = reader.readtext(image, detail=1, paragraph=False)
        if not results:
            return "", 0.0
        texts = [r[1] for r in results]
        scores = [r[2] for r in results]
        confidence = float(np.mean(scores)) if scores else 0.0
        return " ".join(texts), confidence

    def _run_tesseract(self, image: np.ndarray) -> tuple[str, float]:
        try:
            data = pytesseract.image_to_data(
                image,
                lang="eng+nep",
                config="--oem 3 --psm 6",
                output_type=pytesseract.Output.DICT,
            )
            texts, confs = [], []
            for i, conf in enumerate(data["conf"]):
                if int(conf) > 0:
                    texts.append(data["text"][i])
                    confs.append(int(conf) / 100.0)
            confidence = float(np.mean(confs)) if confs else 0.0
            return " ".join(t for t in texts if t.strip()), confidence
        except Exception:
            logger.exception("Tesseract failed")
            return "", 0.0

    def _get_reader(self):
        if self._reader is None:
            import easyocr
            self._reader = easyocr.Reader(["en", "ne"], gpu=False, verbose=False)
            logger.info("EasyOCR reader initialised")
        return self._reader
