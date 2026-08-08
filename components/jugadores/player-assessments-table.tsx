import Link from "next/link";
import { formatIndicator, formatPercentage } from "@/lib/format";

type AssessmentRow = {
  id: string;
  assessment_date: string;
  label: string;
  weight_kg: number;
  fat_percentage: number | null;
  aks_index: number | null;
};

export function PlayerAssessmentsTable({ assessments }: { assessments: AssessmentRow[] }) {
  if (assessments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-6 text-center text-sm text-muted">
        Este jugador todavía no tiene valoraciones registradas.
      </div>
    );
  }

  // Más reciente primero para la tabla (las queries traen ascendente, útil para el gráfico).
  const rows = [...assessments].reverse();

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted">
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Etiqueta</th>
            <th className="px-4 py-3 font-medium">Peso</th>
            <th className="px-4 py-3 font-medium">% Grasa</th>
            <th className="px-4 py-3 font-medium">AKS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((assessment) => (
            <tr key={assessment.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <Link
                  href={`/valoraciones/${assessment.id}`}
                  className="data font-medium text-foreground hover:underline"
                >
                  {assessment.assessment_date}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{assessment.label}</td>
              <td className="data px-4 py-3 text-muted">{formatIndicator(assessment.weight_kg, 1, " kg")}</td>
              <td className="data px-4 py-3 text-muted">{formatPercentage(assessment.fat_percentage)}</td>
              <td className="data px-4 py-3 text-muted">{formatIndicator(assessment.aks_index, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
