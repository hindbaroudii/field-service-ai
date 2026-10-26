
import { useState } from "react";
import {
  Sparkles,
  Check,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import AudioUpload from "./features/audio/AudioUpload";
import TranscriptEditor from "./features/transcription/TranscriptEditor";
import WorkOrder from "./features/work-orders/WorkOrder";

import { transcribeAudio, generateWorkOrder } from "./services/api";
import { downloadWorkOrderPDF } from "./utils/pdfExport";
import type { WorkOrderReport } from "./types/report";

import "./App.css";

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [report, setReport] = useState<WorkOrderReport | null>(null);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [audioError, setAudioError] = useState("");
  const [reportError, setReportError] = useState("");

  // Bepaal automatisch welke stap actief is.
  const currentStep = report
    ? 3
    : transcript.trim() || isGenerating
      ? 2
      : 1;

  const handleTranscribe = async () => {
    if (!audioFile || isTranscribing) return;

    setIsTranscribing(true);
    setAudioError("");
    setReportError("");
    setTranscript("");
    setReport(null);

    try {
      const text = await transcribeAudio(audioFile);
      setTranscript(text);
    } catch (error) {
      setAudioError(
        error instanceof Error
          ? error.message
          : "Transcriptie mislukt."
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!transcript.trim() || isGenerating) return;

    setIsGenerating(true);
    setReportError("");
    setReport(null);

    try {
      const result = await generateWorkOrder(transcript);
      setReport(result);
    } catch (error) {
      setReportError(
        error instanceof Error
          ? error.message
          : "Werkbon genereren mislukt."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = [
    { number: 1, label: "Audio uploaden" },
    { number: 2, label: "Transcriptie controleren" },
    { number: 3, label: "Werkbon genereren" },
  ];

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div className="topbar">
          <span>Workspace / Nieuwe werkbon</span>

          <span className="status">
            <span className="status-dot" />
            Prototype
          </span>
        </div>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">AI WORKFLOW</span>

              <h1>Nieuwe werkbon</h1>

              <p>
                Zet een gesproken servicemelding om naar
                een professionele werkbon.
              </p>
            </div>

            <div className="ai-label">
              <Sparkles size={17} />
              AI-powered
            </div>
          </div>

          {/* Dynamische workflow */}
          <div className="steps" aria-label="Voortgang werkbon">
            {steps.map((step) => {
              const isCompleted =
                step.number < currentStep ||
                (step.number === 3 && Boolean(report));

              const isCurrent =
                step.number === currentStep && !isCompleted;

              const isLoading =
                (step.number === 1 && isTranscribing) ||
                (step.number === 2 && isGenerating);

              const className = [
                "step",
                isCompleted ? "completed" : "",
                isCurrent ? "current" : "",
                isLoading ? "loading" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div className={className} key={step.number}>
                  <span className="step-number">
                    {isLoading ? (
                      <LoaderCircle
                        size={19}
                        className="spin"
                      />
                    ) : isCompleted ? (
                      <Check size={19} strokeWidth={3} />
                    ) : (
                      step.number
                    )}
                  </span>

                  <span className="step-label"> {step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Status tijdens verwerking */}
          {(isTranscribing || isGenerating) && (
            <div className="processing-notice" role="status">
              <LoaderCircle
                size={22}
                className="spin"
              />

              <div>
                <strong>
                  {isTranscribing
                    ? "Audio wordt getranscribeerd..."
                    : "AI genereert je werkbon..."}
                </strong>

                <p>
                  {isTranscribing
                    ? "Whisper verwerkt je opname. Dit kan even duren."
                    : "De AI verwerkt de informatie tot een gestructureerde werkbon."}
                </p>
              </div>
            </div>
          )}

          <AudioUpload
            audioFile={audioFile}
            isTranscribing={isTranscribing}
            error={audioError}
            onFileChange={(file) => {
              setAudioFile(file);
              setTranscript("");
              setReport(null);
              setAudioError("");
              setReportError("");
            }}
            onTranscribe={handleTranscribe}
          />

          <TranscriptEditor
            transcript={transcript}
            isGenerating={isGenerating}
            onTranscriptChange={(text) => {
              setTranscript(text);
              setReport(null);
              setReportError("");
            }}
            onGenerate={handleGenerateReport}
          />

          {reportError && (
            <div className="error-notice" role="alert">
              <AlertCircle size={22} />

              <div>
                <strong>Werkbon genereren mislukt</strong>
                <p>{reportError}</p>
              </div>
            </div>
          )}

          {report && (
            <WorkOrder
              report={report}
              onReportChange={setReport}
              onDownloadPDF={() => downloadWorkOrderPDF(report)}
            />
          )}

          <p className="disclaimer">
            AI kan fouten maken. Controleer de gegevens
            voordat je een werkbon definitief maakt.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
