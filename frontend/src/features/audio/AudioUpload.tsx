
import { useEffect, useRef, useState } from "react";
import {
  Mic,
  UploadCloud,
  CheckCircle2,
  CircleStop,
  Trash2,
} from "lucide-react";

interface AudioUploadProps {
  audioFile: File | null;
  isTranscribing: boolean;
  error: string;
  onFileChange: (file: File | null) => void;
  onTranscribe: () => void;
}

export default function AudioUpload({
  audioFile,
  isTranscribing,
  error,
  onFileChange,
  onTranscribe,
}: AudioUploadProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!audioFile) {
      setAudioUrl(null);
      return;
    }

    const url = URL.createObjectURL(audioFile);
    setAudioUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [audioFile]);

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = async () => {
    setRecordingError("");

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setRecordingError(
        "Audio opnemen wordt niet ondersteund door deze browser."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = [
        "audio/webm",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );

      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const extension = type.includes("mp4") ? "m4a" : "webm";

        const blob = new Blob(chunksRef.current, {
          type,
        });

        if (blob.size > 0) {
          const file = new File(
            [blob],
            `opname-${Date.now()}.${extension}`,
            { type }
          );

          onFileChange(file);
        }

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
      };

      recorder.onerror = () => {
        setRecordingError("Er is iets misgegaan tijdens de opname.");
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setRecordingError(
        "Geen toegang tot de microfoon. Controleer je browserinstellingen."
      );
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;

    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  };

  const removeAudio = () => {
    onFileChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <div className="panel-icon">
          <Mic size={21} />
        </div>
        <div>
          <h2>Audio toevoegen</h2>
          <p>
            Upload een bestaande opname of neem direct audio op.
          </p>
        </div>
      </div>

      <div className="audio-options">
        <label className="audio-option">
          <UploadCloud size={28} />
          <strong>Audio uploaden</strong>
          <span>Kies een audiobestand</span>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            disabled={isRecording || isTranscribing}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              onFileChange(file);
            }}
            hidden
          />
        </label>

        <button
          type="button"
          className={`audio-option ${isRecording ? "recording" : ""}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
        >
          {isRecording ? (
            <CircleStop size={28} />
          ) : (
            <Mic size={28} />
          )}

          <strong>
            {isRecording ? "Opname stoppen" : "Direct opnemen"}
          </strong>

          <span>
            {isRecording
              ? "Klik om de opname te stoppen"
              : "Gebruik je microfoon"}
          </span>
        </button>
      </div>

      {isRecording && (
        <div className="recording-indicator">
          <span className="recording-dot" />
          Opname bezig...
        </div>
      )}

      {audioFile && audioUrl && !isRecording && (
        <div className="audio-preview">
          <div className="audio-preview-header">
            <div className="file-selected">
              <CheckCircle2 size={17} />
              {audioFile.name}
            </div>

            <button
              type="button"
              className="remove-audio"
              onClick={removeAudio}
              disabled={isTranscribing}
              title="Audio verwijderen"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <p className="audio-preview-title">
            Beluister je opname
          </p>

          <audio
            key={audioUrl}
            controls
            preload="metadata"
            src={audioUrl}
          />

          <button
            type="button"
            className="primary-button"
            onClick={onTranscribe}
            disabled={isTranscribing}
            style={{ marginTop: "18px" }}
          >
            <Mic size={18} />
            {isTranscribing
              ? "Audio verwerken..."
              : "Audio transcriberen"}
          </button>
        </div>
      )}

      {(recordingError || error) && (
        <p style={{ color: "#dc2626", marginTop: "12px" }}>
          {recordingError || error}
        </p>
      )}
    </section>
  );
}
