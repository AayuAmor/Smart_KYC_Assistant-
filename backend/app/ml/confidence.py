import re

FIELD_PATTERNS = {
    "id_number": [r"\d{2}-\d{2}-\d{2}-\d{5}", r"[A-Z]{2}\d{7}", r"\d{7,}"],
    "dob": [r"\d{4}-\d{2}-\d{2}", r"\d{2}/\d{2}/\d{4}", r"\d{4}/\d{2}/\d{2}"],
    "phone": [r"9[678]\d{8}", r"\+977[-\s]?9[678]\d{8}"],
}

FIELD_WEIGHTS = {
    "full_name": 1.5,
    "id_number": 1.5,
    "dob": 1.2,
    "address": 1.0,
    "issued_district": 0.8,
    "issued_date": 0.8,
}


def score_extracted_fields(fields: dict) -> dict[str, float]:
    scores: dict[str, float] = {}
    for field, value in fields.items():
        if not value:
            scores[field] = 0.0
            continue
        value_str = str(value).strip()
        if field in FIELD_PATTERNS:
            matched = any(re.search(p, value_str) for p in FIELD_PATTERNS[field])
            scores[field] = 0.95 if matched else 0.55
        elif field == "full_name":
            parts = value_str.split()
            scores[field] = 0.92 if len(parts) >= 2 and all(p.replace(".", "").isalpha() for p in parts) else 0.60
        elif field == "address":
            scores[field] = 0.85 if len(value_str) > 6 else 0.50
        else:
            scores[field] = 0.80 if len(value_str) > 2 else 0.40
    return scores


def compute_overall_confidence(field_scores: dict[str, float]) -> float:
    if not field_scores:
        return 0.0
    total_weight = 0.0
    weighted_sum = 0.0
    for field, score in field_scores.items():
        weight = FIELD_WEIGHTS.get(field, 1.0)
        weighted_sum += score * weight
        total_weight += weight
    return round(weighted_sum / total_weight, 3) if total_weight > 0 else 0.0
