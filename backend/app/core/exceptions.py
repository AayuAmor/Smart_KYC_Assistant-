from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(self, status_code: int, detail: str, error_code: str = "APP_ERROR"):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code
        super().__init__(detail)


class KYCNotFoundException(AppException):
    def __init__(self, kyc_id: str):
        super().__init__(404, f"KYC record {kyc_id} not found", "KYC_NOT_FOUND")


class FileTooLargeException(AppException):
    def __init__(self):
        super().__init__(413, "File exceeds maximum allowed size", "FILE_TOO_LARGE")


class InvalidFileTypeException(AppException):
    def __init__(self, ext: str):
        super().__init__(400, f"File type .{ext} is not allowed", "INVALID_FILE_TYPE")


class FaceVerificationException(AppException):
    def __init__(self, reason: str):
        super().__init__(422, reason, "FACE_VERIFICATION_FAILED")


class ChatServiceException(AppException):
    def __init__(self, reason: str):
        super().__init__(502, reason, "CHAT_SERVICE_ERROR")


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "error_code": exc.error_code, "detail": exc.detail},
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    from loguru import logger
    logger.exception("Unhandled exception")
    return JSONResponse(
        status_code=500,
        content={"error": True, "error_code": "INTERNAL_ERROR", "detail": "An unexpected error occurred"},
    )
