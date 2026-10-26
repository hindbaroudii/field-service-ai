
import { CheckCircle2, Download, MapPin } from "lucide-react";
import type { WorkOrderReport } from "../../types/report";
import { formatReportValue } from "../../utils/formatReport";

interface WorkOrderProps {
  report: WorkOrderReport;
  onReportChange: (report: WorkOrderReport) => void;
  onDownloadPDF: () => void;
}

const fields: {
  label: string;
  key: keyof WorkOrderReport;
}[] = [
  { label: "Probleem", key: "problem" },
  { label: "Uitgevoerde werkzaamheden", key: "work_performed" },
  { label: "Gewerkte uren", key: "hours_worked" },
  { label: "Technische opmerkingen", key: "technical_notes" },
  { label: "Opvolgnotities", key: "follow_up_notes" },
];

export default function WorkOrder({
  report,
  onReportChange,
  onDownloadPDF,
}: WorkOrderProps) {
  const updateField = (
    key: keyof WorkOrderReport,
    value: string
  ) => {
    let updatedValue: unknown = value;

    if (key === "work_performed" || key === "technical_notes") {
      updatedValue = value.split("\n").filter(Boolean);
    }

    if (key === "hours_worked") {
      const parsed = Number(value);
      updatedValue =
        value.trim() === "" || !Number.isFinite(parsed) || parsed < 0
          ? null
          : parsed;
    }

    onReportChange({
      ...report,
      [key]: updatedValue,
    });
  };

  const updateMaterial = (
    index: number,
    field: "name" | "quantity" | "unit",
    value: string
  ) => {
    const materials = report.materials.map((material, i) => {
      if (i !== index) return material;

      return {
        ...material,
        [field]:
          field === "quantity"
            ? value.trim() === ""
              ? null
              : Number(value)
            : value,
      };
    });

    onReportChange({ ...report, materials });
  };

  const addressFields: {
    label: string;
    key: keyof WorkOrderReport;
    placeholder: string;
  }[] = [
    { label: "Straatnaam", key: "street", placeholder: "Bijv. Kerkstraat" },
    { label: "Huisnummer", key: "house_number", placeholder: "Bijv. 24A" },
    { label: "Postcode", key: "postal_code", placeholder: "Bijv. 6828 AB" },
    { label: "Plaats", key: "city", placeholder: "Bijv. Arnhem" },
  ];

  return (
    <section className="panel">
      <div className="panel-heading">
        <div className="panel-icon">
          <CheckCircle2 size={21} />
        </div>
        <div>
          <h2>Gegenereerde werkbon</h2>
          <p>Controleer en bewerk de gegevens.</p>
        </div>
      </div>

      <div className="report-section">
        <div className="report-section-title">
          <MapPin size={18} />
          <h3>Klantgegevens</h3>
        </div>

        <div className="report-field">
          <label htmlFor="customer-name">Klantnaam</label>
          <input
            id="customer-name"
            value={report.customer_name ?? ""}
            placeholder="Naam van de klant"
            onChange={(event) =>
              updateField("customer_name", event.target.value)
            }
          />
        </div>

        <div className="address-grid">
          {addressFields.map(({ label, key, placeholder }) => (
            <div className="report-field" key={key}>
              <label htmlFor={`address-${key}`}>{label}</label>
              <input
                id={`address-${key}`}
                value={formatReportValue(report[key])}
                placeholder={placeholder}
                onChange={(event) =>
                  updateField(key, event.target.value)
                }
              />
            </div>
          ))}
        </div>

        <div className="report-field">
          <label htmlFor="service-location">Locatie / ruimte</label>
          <input
            id="service-location"
            value={report.location ?? ""}
            placeholder="Bijv. meterkast of technische ruimte"
            onChange={(event) =>
              updateField("location", event.target.value)
            }
          />
        </div>
      </div>

      <div className="report-section">
        <h3>Werkzaamheden</h3>

        {fields.map(({ label, key }) => (
          <div className="report-field" key={key}>
            <label htmlFor={`report-${key}`}>{label}</label>
            <textarea
              id={`report-${key}`}
              rows={
                key === "problem" || key === "work_performed"
                  ? 3
                  : 2
              }
              value={formatReportValue(report[key])}
              onChange={(event) =>
                updateField(key, event.target.value)
              }
            />
          </div>
        ))}
      </div>

      <div className="report-section">
        <h3>Materialen</h3>

        {(report.materials ?? []).map((material, index) => (
          <div className="material-row" key={index}>
            <input
              aria-label={`Materiaal ${index + 1}`}
              placeholder="Materiaal"
              value={material.name ?? ""}
              onChange={(event) =>
                updateMaterial(index, "name", event.target.value)
              }
            />
            <input
              aria-label={`Aantal ${index + 1}`}
              type="number"
              min="0"
              placeholder="Aantal"
              value={material.quantity ?? ""}
              onChange={(event) =>
                updateMaterial(index, "quantity", event.target.value)
              }
            />
            <input
              aria-label={`Eenheid ${index + 1}`}
              placeholder="Eenheid"
              value={material.unit ?? ""}
              onChange={(event) =>
                updateMaterial(index, "unit", event.target.value)
              }
            />
          </div>
        ))}

        {(!report.materials || report.materials.length === 0) && (
          <p className="empty-message">
            Geen materialen opgegeven.
          </p>
        )}

        <button
          className="secondary-button"
          type="button"
          onClick={() =>
            onReportChange({
              ...report,
              materials: [
                ...(report.materials ?? []),
                { name: "", quantity: null, unit: null },
              ],
            })
          }
        >
          + Materiaal toevoegen
        </button>
      </div>

      <div className="report-section">
        <h3>Opvolging</h3>

        <div className="report-field">
          <label htmlFor="follow-up-required">Opvolging nodig</label>
          <select
            id="follow-up-required"
            value={
              report.follow_up_required === null
                ? "onbekend"
                : report.follow_up_required
                  ? "ja"
                  : "nee"
            }
            onChange={(event) =>
              onReportChange({
                ...report,
                follow_up_required:
                  event.target.value === "onbekend"
                    ? null
                    : event.target.value === "ja",
              })
            }
          >
            <option value="onbekend">Onbekend</option>
            <option value="nee">Nee</option>
            <option value="ja">Ja</option>
          </select>
        </div>
      </div>

      <button
        className="primary-button"
        type="button"
        onClick={onDownloadPDF}
      >
        <Download size={18} />
        Download werkbon als PDF
      </button>
    </section>
  );
}
