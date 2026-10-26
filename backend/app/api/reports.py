
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.schemas.service_report import ServiceReport
from app.services.report_service import generate_service_report


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


class GenerateReportRequest(BaseModel):
    transcript: str


@router.post("/generate", response_model=ServiceReport)
def generate_report(request: GenerateReportRequest):
    if not request.transcript.strip():
        raise HTTPException(
            status_code=400,
            detail="Transcript cannot be empty",
        )

    return generate_service_report(request.transcript)
