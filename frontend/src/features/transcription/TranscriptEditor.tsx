
import { Files, Sparkles } from "lucide-react";

interface TranscriptEditorProps {
  transcript: string;
  isGenerating: boolean;
  onTranscriptChange: (value: string) => void;
  onGenerate: () => void;
}

export default function TranscriptEditor({
  transcript,
  isGenerating,
  onTranscriptChange,
  onGenerate,
}: TranscriptEditorProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div className="panel-icon">
          <Files size={21} />
        </div>

        <div>
          <h2>Transcriptie controleren</h2>
          <p>
            Controleer de herkende tekst en verbeter
            eventuele fouten.
          </p>
        </div>
      </div>

      <textarea
        className="transcript-input"
        rows={7}
        placeholder="Hier verschijnt straks de transcriptie..."
        value={transcript}
        onChange={(event) =>
          onTranscriptChange(event.target.value)
        }
      />

      <div className="panel-footer">
        <span>{transcript.length} tekens</span>

        <button
          className="primary-button"
          onClick={onGenerate}
          disabled={!transcript.trim() || isGenerating}
        >
          <Sparkles size={18} />
          {isGenerating
            ? "Werkbon genereren..."
            : "Genereer werkbon"}
        </button>
      </div>
    </section>
  );
}
