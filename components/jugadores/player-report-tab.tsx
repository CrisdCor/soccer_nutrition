"use client";

import { useState } from "react";
import { AssessmentDetailGroups, type AssessmentDetailFields } from "@/components/valoraciones/assessment-detail-groups";
import { classifyByThreshold, formatClassification, formatIndicator, formatPercentage, type ThresholdRange } from "@/lib/format";

type ReportAssessment = AssessmentDetailFields & { id: string; assessment_date: string; label: string };

export function PlayerReportTab({
  playerName,
  playerDocument,
  photoUrl,
  assessments,
  thresholds,
}: {
  playerName: string;
  playerDocument: string;
  photoUrl: string | null;
  /** Más reciente primero. */
  assessments: ReportAssessment[];
  thresholds: { skinfold_sum: ThresholdRange | null; aks_index: ThresholdRange | null };
}) {
  const [selectedId, setSelectedId] = useState(assessments[0]?.id ?? "");
  const assessment = assessments.find((a) => a.id === selectedId) ?? assessments[0];

  if (!assessment) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
        Este jugador todavía no tiene valoraciones registradas.
      </div>
    );
  }

  const fatClassification = classifyByThreshold(assessment.skinfold_sum_6, thresholds.skinfold_sum);
  const aksClassification = classifyByThreshold(assessment.aks_index, thresholds.aks_index);

  return (
    <div className="space-y-6">
      <select
        className="w-auto rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-red"
        value={assessment.id}
        onChange={(event) => setSelectedId(event.target.value)}
      >
        {assessments.map((a) => (
          <option key={a.id} value={a.id}>
            {a.assessment_date} · {a.label}
          </option>
        ))}
      </select>

      {/* Encabezado tipo informe: pensado para verse completo en pantalla, no como un formulario más. */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-background">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL firmada de corta duración.
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">Sin foto</div>
            )}
          </div>

          <div className="min-w-[10rem] flex-1 space-y-1">
            <h3 className="text-base font-semibold text-foreground">{playerName}</h3>
            <p className="data text-sm text-muted">{playerDocument}</p>
            <p className="text-sm text-muted">
              {assessment.label} · {assessment.assessment_date}
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            <ReportStat label="IMC" value={formatIndicator(assessment.bmi, 2)} />
            <ReportStat
              label="% Grasa (Yuhasz)"
              value={formatPercentage(assessment.fat_percentage)}
              sub={formatClassification(fatClassification)}
            />
            <ReportStat
              label="AKS"
              value={formatIndicator(assessment.aks_index, 2)}
              sub={formatClassification(aksClassification)}
            />
          </div>
        </div>
      </div>

      <AssessmentDetailGroups assessment={assessment} />

      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-6">
        <h3 className="text-sm font-semibold text-foreground">Diagnóstico nutricional</h3>
        <p className="mt-2 text-sm text-muted">
          Pendiente — se construye en el módulo de Plan de Alimentación (en paralelo).
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-6">
        <h3 className="text-sm font-semibold text-foreground">Plan de alimentación</h3>
        <p className="mt-2 text-sm text-muted">Plan de alimentación — próximamente.</p>
      </div>
    </div>
  );
}

function ReportStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="data text-lg font-semibold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}
