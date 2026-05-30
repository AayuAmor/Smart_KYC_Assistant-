import numpy as np
import cv2
from loguru import logger

KEYWORDS: dict[str, list[str]] = {
    "citizenship": [
        "नागरिकता", "नागरिक", "citizenship", "citizen", "permanent",
        "nepal", "नेपाल", "राष्ट्रिय", "national", "जन्म", "birth",
    ],
    "passport": [
        "passport", "passeport", "republic of nepal", "नेपाल सरकार",
        "travel", "nationality", "expiry", "date of expiry", "given names",
    ],
    "license": [
        "driving", "driver", "license", "licence", "यातायात",
        "vehicle", "class", "category", "department of transport",
    ],
    "voter_id": [
        "voter", "election", "मतदाता", "निर्वाचन", "ballot",
        "ward", "municipality", "vote", "electoral",
    ],
}


class DocumentClassifier:
    def classify(self, ocr_text: str, image: np.ndarray) -> tuple[str, float]:
        text_lower = ocr_text.lower()
        keyword_scores = {
            doc_type: self._keyword_score(text_lower, kws)
            for doc_type, kws in KEYWORDS.items()
        }
        layout_scores = self._layout_score(image)
        combined = {}
        for doc_type in KEYWORDS:
            combined[doc_type] = (
                0.70 * keyword_scores.get(doc_type, 0.0)
                + 0.30 * layout_scores.get(doc_type, 0.0)
            )
        best = max(combined, key=combined.__getitem__)
        score = combined[best]
        if score < 0.15:
            logger.warning("Classifier confidence too low={:.2f}, returning unknown", score)
            return "unknown", score
        logger.info("Classified as {} confidence={:.2f}", best, score)
        return best, round(score, 3)

    def _keyword_score(self, text: str, keywords: list[str]) -> float:
        hits = sum(1 for kw in keywords if kw.lower() in text)
        return hits / len(keywords) if keywords else 0.0

    def _layout_score(self, image: np.ndarray) -> dict[str, float]:
        if image is None or image.size == 0:
            return {k: 0.0 for k in KEYWORDS}
        h, w = image.shape[:2] if len(image.shape) >= 2 else (1, 1)
        aspect = w / h if h > 0 else 1.0
        gray = image if len(image.shape) == 2 else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(np.sum(edges > 0)) / (h * w) if h * w > 0 else 0.0
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contour_count = len(contours)
        scores: dict[str, float] = {}
        scores["citizenship"] = 0.6 if 1.4 < aspect < 1.8 else 0.2
        scores["passport"] = 0.6 if 0.65 < aspect < 0.85 else 0.2
        scores["license"] = 0.6 if 1.5 < aspect < 1.9 else 0.2
        scores["voter_id"] = 0.5 if 1.3 < aspect < 1.7 else 0.2
        if edge_density > 0.12:
            scores["passport"] = min(1.0, scores["passport"] + 0.2)
        if contour_count > 80:
            scores["passport"] = min(1.0, scores["passport"] + 0.1)
        return scores
