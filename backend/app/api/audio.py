from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.transcription_service import transcribe_audio

router = APIRouter(
    prefix="/audio",
    tags=["Audio"],
)

ALLOWED_CONTENT_TYPES = {
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/mp4",
    "audio/m4a",
}


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format",
        )

    content = await file.read()

    transcript = transcribe_audio(
        audio_bytes=content,
        filename=file.filename or "audio.m4a",
    )

    return {
        "filename": file.filename,
        "transcript": transcript,
    }