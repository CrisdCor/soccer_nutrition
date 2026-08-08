import Link from "next/link";
import { notFound } from "next/navigation";
import { AssessmentDetailGroups } from "@/components/valoraciones/assessment-detail-groups";
import { requireProfile } from "@/lib/auth/session";
import { getAssessmentById } from "@/lib/valoraciones/queries";

export default async function ValoracionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [assessment, { profile }] = await Promise.all([getAssessmentById(id), requireProfile()]);

  if (!assessment) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{assessment.player?.full_name}</h2>
          <p className="text-sm text-muted">
            {assessment.label} · {assessment.assessment_date}
          </p>
        </div>
        {profile.role === "admin" && (
          <Link href={`/valoraciones/${assessment.id}/editar`} className="btn-secondary">
            Editar
          </Link>
        )}
      </div>

      <AssessmentDetailGroups assessment={assessment} />
    </div>
  );
}
