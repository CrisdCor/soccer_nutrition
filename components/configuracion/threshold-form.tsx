"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { thresholdFormSchema, type ThresholdFormValues } from "@/lib/validation/threshold";

export function ThresholdForm({
  action,
}: {
  action: (values: ThresholdFormValues) => Promise<{ error?: string } | void>;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ThresholdFormValues>({
    resolver: zodResolver(thresholdFormSchema),
    defaultValues: {
      metric: "skinfold_sum",
      low_cut: "",
      high_cut: "",
      effective_from: new Date().toISOString().slice(0, 10),
    },
  });

  async function onSubmit(values: ThresholdFormValues) {
    setFormError(null);
    const result = await action(values);
    if (result?.error) {
      setFormError(result.error);
      return;
    }
    reset({ ...values, low_cut: "", high_cut: "" });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-4" noValidate>
      <Field label="Métrica" error={errors.metric?.message}>
        <select className="select" {...register("metric")}>
          <option value="skinfold_sum">Suma 6 Pliegues</option>
          <option value="aks_index">AKS</option>
        </select>
      </Field>

      <Field label="Umbral bajo" error={errors.low_cut?.message}>
        <input type="number" step="0.01" className="input" {...register("low_cut")} />
      </Field>

      <Field label="Umbral alto" error={errors.high_cut?.message}>
        <input type="number" step="0.01" className="input" {...register("high_cut")} />
      </Field>

      <Field label="Vigente desde" error={errors.effective_from?.message}>
        <input type="date" className="input" {...register("effective_from")} />
      </Field>

      {formError && (
        <p role="alert" className="sm:col-span-4 rounded-md border border-border-strong px-3 py-2 text-sm text-foreground">
          {formError}
        </p>
      )}

      <div className="sm:col-span-4">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Guardando…" : "Agregar umbral"}
        </button>
      </div>
    </form>
  );
}
