import Link from "next/link";
import { formatIndicator, formatPercentage } from "@/lib/format";
import { listAssessments } from "@/lib/valoraciones/queries";

export default async function ValoracionesPage() {
  const assessments = await listAssessments();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Valoraciones</h2>
        <p className="text-sm text-muted">
          Registro insert-only; solo admin puede editar una valoración ya guardada.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Jugador</th>
              <th className="px-4 py-3 font-medium">Etiqueta</th>
              <th className="px-4 py-3 font-medium">Peso</th>
              <th className="px-4 py-3 font-medium">% Grasa</th>
              <th className="px-4 py-3 font-medium">AKS</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment) => (
              <tr key={assessment.id} className="border-b border-border last:border-0">
                <td className="data px-4 py-3 text-muted">{assessment.assessment_date}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/valoraciones/${assessment.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {assessment.player?.full_name ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{assessment.label}</td>
                <td className="data px-4 py-3 text-muted">{formatIndicator(assessment.weight_kg, 1, " kg")}</td>
                <td className="data px-4 py-3 text-muted">{formatPercentage(assessment.fat_percentage)}</td>
                <td className="data px-4 py-3 text-muted">{formatIndicator(assessment.aks_index, 2)}</td>
              </tr>
            ))}
            {assessments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                  No hay valoraciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
