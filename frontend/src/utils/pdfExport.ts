
import { jsPDF } from "jspdf";
import type { WorkOrderReport } from "../types/report";
import { formatReportValue } from "./formatReport";

export function downloadWorkOrderPDF(report: WorkOrderReport) {
  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - 20) {
      pdf.addPage();
      y = 25;
    }
  };

  const addSection = (title: string) => {
    ensureSpace(22);

    y += 8;
    pdf.setFillColor(235, 247, 242);
    pdf.roundedRect(margin, y - 6, contentWidth, 12, 2, 2, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(20, 134, 109);
    pdf.text(title, margin + 4, y + 2);

    y += 16;
  };

  const addField = (label: string, value: string | null | undefined) => {
    const text = value?.trim() || "Niet ingevuld";

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    const lines = pdf.splitTextToSize(
      text,
      contentWidth
    ) as string[];

    ensureSpace(10 + lines.length * 6 + 8);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(23, 44, 59);
    pdf.text(label, margin, y);

    y += 7;

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(75, 85, 95);
    pdf.text(lines, margin, y);

    y += lines.length * 6 + 8;
  };

  // Header
  pdf.setFillColor(23, 44, 59);
  pdf.rect(0, 0, pageWidth, 52, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(21);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Field Service AI", margin, 25);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(117, 215, 189);
  pdf.text("SERVICEWERKBON", margin, 36);

  y = 65;

  pdf.setFontSize(10);
  pdf.setTextColor(100, 110, 120);
  pdf.text(
    `Datum: ${new Date().toLocaleDateString("nl-NL")}`,
    margin,
    y
  );

  y += 12;

  // Klantgegevens
  addSection("Klantgegevens");

  addField("Klant", report.customer_name);

  const streetAddress = [
    report.street,
    report.house_number,
  ]
    .filter(Boolean)
    .join(" ");

  const cityAddress = [
    report.postal_code,
    report.city,
  ]
    .filter(Boolean)
    .join(" ");

  addField("Straat en huisnummer", streetAddress);
  addField("Postcode en plaats", cityAddress);
  addField("Locatie / ruimte", report.location);

  // Werkzaamheden
  addSection("Werkzaamheden");

  addField("Probleem", report.problem);

  addField(
    "Uitgevoerde werkzaamheden",
    formatReportValue(report.work_performed)
  );

  addField(
    "Gewerkte uren",
    report.hours_worked === null
      ? null
      : `${report.hours_worked} uur`
  );

  // Materialen
  addSection("Materialen");

  const materials = report.materials
    .map((material) => {
      const quantity =
        material.quantity === null
          ? ""
          : String(material.quantity);

      return [
        quantity,
        material.unit ?? "",
        material.name,
      ]
        .filter(Boolean)
        .join(" ");
    })
    .join("\n");

  addField("Gebruikte materialen", materials);

  // Technische opmerkingen
  addSection("Technische opmerkingen");

  addField(
    "Opmerkingen",
    formatReportValue(report.technical_notes)
  );

  // Opvolging
  addSection("Opvolging");

  const followUp =
    report.follow_up_required === null
      ? "Onbekend"
      : report.follow_up_required
        ? "Ja"
        : "Nee";

  addField("Opvolging nodig", followUp);
  addField("Opvolgnotities", report.follow_up_notes);

  // Footer op iedere pagina
  const totalPages = pdf.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    pdf.setPage(page);

    pdf.setDrawColor(225, 232, 229);
    pdf.line(margin, pageHeight - 17, pageWidth - margin, pageHeight - 17);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(140, 150, 155);

    pdf.text(
      "Gegenereerd met Field Service AI - Controleer alle gegevens.",
      margin,
      pageHeight - 11
    );

    pdf.text(
      `${page} / ${totalPages}`,
      pageWidth - margin,
      pageHeight - 11,
      { align: "right" }
    );
  }

  pdf.save("field-service-werkbon.pdf");
}
