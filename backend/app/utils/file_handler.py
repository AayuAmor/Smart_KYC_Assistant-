import uuid
import re
import aiofiles
from pathlib import Path
from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import FileTooLargeException, InvalidFileTypeException


def sanitize_filename(name: str) -> str:
    name = re.sub(r"[^\w\.\-]", "_", name)
    return name[:120]


async def save_upload(file: UploadFile, destination_dir: str) -> tuple[str, int]:
    original = file.filename or "upload"
    ext = Path(original).suffix.lstrip(".").lower()
    if ext not in settings.allowed_extensions_set:
        raise InvalidFileTypeException(ext)

    safe_name = f"{uuid.uuid4().hex}_{sanitize_filename(original)}"
    dest_path = Path(destination_dir) / safe_name
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    size = 0
    async with aiofiles.open(dest_path, "wb") as out:
        while chunk := await file.read(1024 * 64):
            size += len(chunk)
            if size > settings.max_upload_bytes:
                await out.close()
                dest_path.unlink(missing_ok=True)
                raise FileTooLargeException()
            await out.write(chunk)

    return str(dest_path), size
