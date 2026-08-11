// Extraído de PlayersTable (/jugadores) para que Pesajes reutilice el mismo
// filtro por nombre en vez de reconstruirlo -- ver spec del handoff.

/**
 * Sin acentos/mayúsculas: para que "jose" encuentre "José" -- normalize()
 * separa los diacríticos en marcas combinables (\p{Diacritic}) y las quita.
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function NameSearchInput({
  value,
  onChange,
  placeholder = "Buscar por nombre…",
  "aria-label": ariaLabel = "Buscar por nombre",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
}) {
  return (
    <input
      type="text"
      className="input max-w-xs"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
    />
  );
}
