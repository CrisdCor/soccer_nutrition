"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { assessmentFormSchema, type AssessmentFormValues } from "@/lib/validation/assessment";

type AssessmentFormProps = {
  defaultValues?: Partial<AssessmentFormValues>;
  action: (values: AssessmentFormValues) => Promise<{ error?: string } | void>;
  submitLabel: string;
  /** Ya no hay redirect() en la server action (no hay a dónde navegar desde
   * un panel lateral): esto le avisa al panel que se guardó bien para que
   * se cierre y refresque los datos. */
  onSuccess?: () => void;
  /** Botón "Cancelar" opcional -- típicamente cierra el panel sin guardar. */
  onCancel?: () => void;
};

export function AssessmentForm({ defaultValues, action, submitLabel, onSuccess, onCancel }: AssessmentFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      assessment_date: new Date().toISOString().slice(0, 10),
      label: "",
      weight_kg: "",
      height_cm: "",
      ...defaultValues,
    },
  });

  async function onSubmit(values: AssessmentFormValues) {
    setFormError(null);
    const result = await action(values);
    if (result?.error) {
      setFormError(result.error);
      return;
    }
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8" noValidate>
      <Section title="Datos generales">
        <Field
          label="Fecha de la valoración"
          error={errors.assessment_date?.message}
          className="col-span-2 sm:col-span-1"
        >
          <input type="date" className="input" {...register("assessment_date")} />
        </Field>
        <Field label="Etiqueta" error={errors.label?.message} className="col-span-2 sm:col-span-1">
          <input className="input" placeholder="Ej. Pretemporada 2026" {...register("label")} />
        </Field>
        <NumField label="Peso (kg)" name="weight_kg" register={register} errors={errors} />
        <NumField label="Talla (cm)" name="height_cm" register={register} errors={errors} />
        <NumField label="Talla sentado (cm)" name="sitting_height_cm" register={register} errors={errors} />
        <NumField label="Envergadura (cm)" name="wingspan_cm" register={register} errors={errors} />
      </Section>

      <Section title="Pliegues cutáneos (mm)">
        <NumField label="Tríceps" name="skinfold_triceps" register={register} errors={errors} />
        <NumField label="Subescapular" name="skinfold_subscapular" register={register} errors={errors} />
        <NumField label="Bíceps" name="skinfold_biceps" register={register} errors={errors} />
        <NumField label="Cresta ilíaca" name="skinfold_iliac_crest" register={register} errors={errors} />
        <NumField label="Supraespinal" name="skinfold_supraspinal" register={register} errors={errors} />
        <NumField label="Abdominal" name="skinfold_abdominal" register={register} errors={errors} />
        <NumField label="Muslo" name="skinfold_thigh" register={register} errors={errors} />
        <NumField label="Pierna" name="skinfold_calf" register={register} errors={errors} />
      </Section>

      <Section title="Perímetros (cm)">
        <NumField label="Brazo relajado" name="girth_relaxed_arm" register={register} errors={errors} />
        <NumField label="Brazo flexionado" name="girth_flexed_arm" register={register} errors={errors} />
        <NumField label="Cintura" name="girth_waist" register={register} errors={errors} />
        <NumField label="Cadera" name="girth_hip" register={register} errors={errors} />
        <NumField label="Muslo" name="girth_thigh" register={register} errors={errors} />
        <NumField label="Pierna" name="girth_calf" register={register} errors={errors} />
      </Section>

      <Section title="Diámetros óseos (cm)">
        <NumField label="Húmero" name="diameter_humerus" register={register} errors={errors} />
        <NumField label="Biestiloideo" name="diameter_bistyloid" register={register} errors={errors} />
        <NumField label="Fémur" name="diameter_femur" register={register} errors={errors} />
      </Section>

      {formError && (
        <p role="alert" className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground">
          {formError}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Guardando…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-1 text-sm font-semibold text-foreground">{title}</legend>
      {/* grid-cols-2 desde mobile: son puros campos numéricos cortos (peso,
          talla, cada pliegue/perímetro/diámetro), caben bien de a pares en
          una pantalla angosta -- el título de sección (<legend>, arriba)
          ya funciona como separador a ancho completo sin necesitar tocar
          el grid en sí. sm:grid-cols-2 se mantiene igual (tablet, "2
          columnas donde hoy hay 3"); lg:grid-cols-3 es desktop, sin
          cambios. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </fieldset>
  );
}

function NumField({
  label,
  name,
  register,
  errors,
}: {
  label: string;
  name: keyof AssessmentFormValues;
  register: UseFormRegister<AssessmentFormValues>;
  errors: Partial<Record<keyof AssessmentFormValues, { message?: string }>>;
}) {
  return (
    <Field label={label} error={errors[name]?.message}>
      {/* inputMode="decimal": en mobile (el uso real -- mediciones cargadas
          desde el celular en la cancha) muestra el teclado numérico del
          sistema directo, sin pasar por el alfabético. */}
      <input type="number" step="0.1" inputMode="decimal" className="input" {...register(name)} />
    </Field>
  );
}
