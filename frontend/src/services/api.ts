
import type { WorkOrderReport } from "../types/report";

const API_URL = "http://127.0.0.1:8001";

export async function transcribeAudio(
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/audio/transcribe`,
    {
      method: "POST",
      body: formData,
    }
  );

if (!response.ok) {
  const errorText = await response.text();

  throw new Error(
    `Transcriptie mislukt (${response.status}): ${errorText}`
  );
}

  const data = await response.json();
  return data.transcript ?? "";
}

export async function generateWorkOrder(
  transcript: string
): Promise<WorkOrderReport> {
  const response = await fetch(
    `${API_URL}/reports/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Werkbon genereren mislukt (${response.status})`
    );
  }

  const data = await response.json();

  return data.report ?? data;
}
