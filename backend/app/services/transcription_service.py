import os
import tempfile

from faster_whisper import WhisperModel


model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8",
)


def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    suffix = os.path.splitext(filename)[1] or ".m4a"

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=suffix,
            delete=False,
        ) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name

        segments, _ = model.transcribe(
            temp_path,
            language="nl",
        )

        transcript = " ".join(
            segment.text.strip()
            for segment in segments
        )

        return transcript

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)