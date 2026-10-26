
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.transcription_service import transcribe_audio
from app.schemas.service_report import AudioReportResponse
from app.services.report_service import generate_service_report


router = APIRouter(
    prefix="/audio",
    tags=["Audio"],
)


# Ondersteunde audioformaten
ALLOWED_CONTENT_TYPES = {
    "audio/mpeg",
    "audio/wav",
    "audio/mp3",
    "audio/x-wav",
    "audio/mp4",
    "audio/m4a",
    "audio/webm",
    "video/webm",
    "audio/ogg",
    "audio/x-m4a",
}


def validate_audio(file: UploadFile):
    """
    Controleert of het geüploade bestand
    een ondersteund audioformaat heeft.
    """

    # Verwijder eventuele codec-informatie.
    # Bijvoorbeeld:
    # audio/webm;codecs=opus -> audio/webm
    content_type = (
        (file.content_type or "")
        .split(";")[0]
        .strip()
        .lower()
    )

    print("Audio filename:", file.filename)
    print("Audio content type:", file.content_type)

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format: {file.content_type}",
        )


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Zet een audiobestand om naar tekst.
    Ondersteunt ook browseropnames in WebM-formaat.
    """

    validate_audio(file)

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Audio file is empty",
        )

    transcript = transcribe_audio(
        audio_bytes=content,
        filename=file.filename or "audio.webm",
    )

    return {
        "filename": file.filename,
        "transcript": transcript,
    }


@router.post(
    "/generate-report",
    response_model=AudioReportResponse,
)
async def generate_report_from_audio(
    file: UploadFile = File(...),
):
    """
    Zet audio direct om naar een servicerapport.
    """

    validate_audio(file)

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Audio file is empty",
        )

    transcript = transcribe_audio(
        audio_bytes=content,
        filename=file.filename or "audio.webm",
    )

    if not transcript.strip():
        raise HTTPException(
            status_code=422,
            detail="No speech detected in audio",
        )

    report = generate_service_report(transcript)

    return AudioReportResponse(
        transcript=transcript,
        report=report,
    )
