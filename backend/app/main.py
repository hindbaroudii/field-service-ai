from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.audio import router as audio_router
from app.api.reports import router as reports_router


app = FastAPI(
    title="Field Service AI",
    description="AI-powered assistant for technicians and field service workers.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audio_router)
app.include_router(reports_router)


@app.get("/")
def root():
    return {
        "message": "Field Service AI API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }