from fastapi import FastAPI

from app.api.audio import router as audio_router


app = FastAPI(
    title="Field Service AI",
    description="AI-powered assistant for technicians and field service workers.",
    version="0.1.0",
)

app.include_router(audio_router)


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