"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Option = { id: string; name: string };

export function DashboardFilterBar({ categories }: { categories: Option[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-red"
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(event) => updateParam("category", event.target.value)}
      >
        <option value="">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-red"
        defaultValue={searchParams.get("sex") ?? ""}
        onChange={(event) => updateParam("sex", event.target.value)}
      >
        <option value="">Todos los sexos</option>
        <option value="Hombre">Hombre</option>
        <option value="Mujer">Mujer</option>
      </select>
    </div>
  );
}
