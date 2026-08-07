// Header del shell principal. La info de usuario/organización es un
// placeholder hasta que se implemente el módulo de Auth (sección "Módulos del MVP").
export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div>
        <h1 className="text-sm font-semibold text-foreground">Valoraciones antropométricas</h1>
        <p className="text-xs text-muted">Independiente Medellín</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-md border border-brand-blue-soft bg-brand-blue-soft px-2.5 py-1 text-xs font-medium text-brand-blue">
          nutricionista
        </span>
        <div className="h-8 w-8 rounded-full border border-border bg-background" aria-hidden />
      </div>
    </header>
  );
}
