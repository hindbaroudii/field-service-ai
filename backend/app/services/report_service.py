
import ollama

from app.schemas.service_report import ServiceReport


MODEL_NAME = "qwen2.5:1.5b"



def generate_service_report(transcript: str) -> ServiceReport:
    if not transcript.strip():
        raise ValueError("Transcript cannot be empty")

    system_prompt = """
Je bent een assistent die Nederlandse servicemeldingen
omzet naar gestructureerde werkbonnen.

Gebruik uitsluitend de informatie uit de transcriptie.

INSTRUCTIES:

1. Vul de klantnaam in bij customer_name.
2. Haal het klantadres uit de transcriptie:
   - street: straatnaam zonder huisnummer
   - house_number: huisnummer inclusief eventuele toevoeging
   - postal_code: postcode, bijvoorbeeld 6828 AB
   - city: plaatsnaam

3. Vul de genoemde locatie in bij location als
   algemene locatieomschrijving, indien genoemd.
4. Beschrijf bij problem wat volgens de monteur
   het probleem was. Behoud de oorspronkelijke betekenis.
5. Zet uitgevoerde werkzaamheden in work_performed.
6. Zet expliciet genoemde gebruikte materialen
   in materials.
7. Zet gewerkte tijd om naar een getal in uren.
8. Zet technische opmerkingen in technical_notes.
9. Als de monteur moet terugkomen:
   - follow_up_required = true
   - follow_up_notes = de genoemde vervolgafspraak
10. Als expliciet geen vervolgbezoek nodig is:
   - follow_up_required = false
11. Als een vervolgbezoek niet wordt besproken:
    - follow_up_required = null

BELANGRIJK:

- Verzin geen informatie.
- Voeg geen woorden toe aan namen van onderdelen.
- Neem klantnamen en technische termen zo nauwkeurig
  mogelijk over uit de transcriptie.
- Gebruik null wanneer informatie onbekend is.
- Gebruik lege lijsten wanneer er geen lijstgegevens zijn.
- Schrijf in het Nederlands.
- Geef uitsluitend geldige JSON terug.
"""

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": transcript},
        ],
        format=ServiceReport.model_json_schema(),
        options={"temperature": 0},
    )

    return ServiceReport.model_validate_json(
        response.message.content
    )

