import { notFound } from "next/navigation";
import { AssessmentForm } from "@/components/valoraciones/assessment-form";
import { getPlayerById } from "@/lib/jugadores/queries";
import { createAssessment } from "@/lib/valoraciones/actions";

export default async function NuevaValoracionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerById(id);

  if (!player) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Nueva valoración</h2>
        <p className="text-sm text-muted">{player.full_name}</p>
      </div>

      <AssessmentForm action={createAssessment.bind(null, player.id)} submitLabel="Guardar valoración" />
    </div>
  );
}
