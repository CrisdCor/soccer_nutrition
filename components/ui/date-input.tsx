// Extraído del selector de fecha de Pesajes para que Peso Diario (rango
// desde/hasta) reutilice el mismo componente en vez de reconstruirlo --
// ver spec del handoff.

export function DateInput({
  label,
  value,
  onChange,
  min,
  max,
  "aria-label": ariaLabel,
}: {
  /** Si viene, envuelve el input en un <label> visible con este texto. */
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  "aria-label"?: string;
}) {
  const input = (
    <input
      type="date"
      className="input w-auto"
      value={value}
      min={min}
      max={max}
      onChange={(event) => event.target.value && onChange(event.target.value)}
      aria-label={ariaLabel ?? label}
    />
  );

  if (!label) return input;

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      {label}
      {input}
    </label>
  );
}
