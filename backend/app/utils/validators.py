import re


def validate_nepali_citizenship_number(value: str) -> bool:
    return bool(re.match(r"^\d{2}-\d{2}-\d{2}-\d{5}$", value.strip()))


def validate_nepali_passport_number(value: str) -> bool:
    return bool(re.match(r"^[A-Z]{2}\d{7}$", value.strip()))


def validate_phone_number(value: str) -> bool:
    cleaned = re.sub(r"[\s\-\+]", "", value)
    return bool(re.match(r"^(977)?9[678]\d{8}$", cleaned))
