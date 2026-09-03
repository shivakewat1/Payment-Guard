import re
from typing import Optional

def validate_email(email: Optional[str]) -> bool:
    if not email:
        return False
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return bool(re.match(pattern, email))

def validate_phone(phone: Optional[str]) -> bool:
    if not phone:
        return False
    # Standard Indian phone format with optional +91
    pattern = r"^(\+91[\-\s]?)?[6-9]\d{9}$"
    return bool(re.match(pattern, phone.replace(" ", "")))

def validate_amount(amount: float) -> bool:
    return amount > 0 and amount <= 10_000_000

def sanitize_text(text: str) -> str:
    if not text:
        return ""
    # Strip dangerous HTML/script characters
    return re.sub(r"[<>]", "", text).strip()
