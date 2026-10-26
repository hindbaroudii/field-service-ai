
from pydantic import BaseModel, Field


class Material(BaseModel):
    name: str
    quantity: float | None = None
    unit: str | None = None


class ServiceReport(BaseModel):
    # Klantgegevens
    customer_name: str | None = None

    # Adresgegevens
    street: str | None = None
    house_number: str | None = None
    postal_code: str | None = None
    city: str | None = None

    # Algemene locatieomschrijving
    location: str | None = None

    # Werkzaamheden
    problem: str | None = None
    work_performed: list[str] = Field(default_factory=list)

    # Materialen
    materials: list[Material] = Field(default_factory=list)

    # Gewerkte uren
    hours_worked: float | None = Field(default=None, ge=0)

    # Technische opmerkingen
    technical_notes: list[str] = Field(default_factory=list)

    # Vervolgafspraak
    follow_up_required: bool | None = None
    follow_up_notes: str | None = None


class AudioReportResponse(BaseModel):
    transcript: str
    report: ServiceReport
