
export function formatReportValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Ja" : "Nee";
  }

  if (Array.isArray(value)) {
    return value.map(formatReportValue).join("\n");
  }

  if (typeof value === "object") {
    const item = value as Record<string, unknown>;

    if ("name" in item && "quantity" in item) {
      const name = String(item.name ?? "");
      const quantity = item.quantity ?? "";
      const unit = item.unit ? ` ${item.unit}` : "";

      return `${name} — ${quantity}${unit}`;
    }

    return Object.entries(item)
      .filter(([, val]) => val !== null && val !== "")
      .map(
        ([key, val]) =>
          `${key}: ${formatReportValue(val)}`
      )
      .join(", ");
  }

  return String(value);
}
