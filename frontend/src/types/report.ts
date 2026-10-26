
export interface Material {
  name: string;
  quantity: number | null;
  unit: string | null;
}

export interface WorkOrderReport {
  // Klantgegevens
  customer_name: string | null;

  // Adresgegevens
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;

  // Algemene locatie
  location: string | null;

  // Werkzaamheden
  problem: string | null;
  work_performed: string[];

  // Materialen
  materials: Material[];

  // Gewerkte uren
  hours_worked: number | null;

  // Technische opmerkingen
  technical_notes: string[];

  // Vervolgafspraak
  follow_up_required: boolean | null;
  follow_up_notes: string | null;
}
