from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import AppException, app_exception_handler, generic_exception_handler
from app.api.v1.router import router as v1_router

setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(settings.UPLOAD_DIR + "/documents").mkdir(parents=True, exist_ok=True)
    Path(settings.UPLOAD_DIR + "/selfies").mkdir(parents=True, exist_ok=True)
    logger.info("Smart KYC backend started — env={}", settings.APP_ENV)
    yield
    logger.info("Smart KYC backend shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(v1_router, prefix="/api/v1")
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/")
async def root():
    return {"status": "ok", "service": "Smart KYC API"}


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "environment": settings.APP_ENV}
