
import os
import tempfile
import time

from faster_whisper import WhisperModel


model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8",
    cpu_threads=4,
)


def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    start_time = time.perf_counter()

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
            beam_size=1,
            vad_filter=True,
        )

        transcript = " ".join(
            segment.text.strip()
            for segment in segments
        )

        duration = time.perf_counter() - start_time
        print(f"Transcriptie duurde {duration:.2f} seconden")

        return transcript

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
