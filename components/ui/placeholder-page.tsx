export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted">{description}</p>
      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center">
        <p className="text-sm text-muted">Módulo pendiente de construcción.</p>
      </div>
    </div>
  );
}
