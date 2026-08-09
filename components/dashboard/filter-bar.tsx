"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FilterSelect } from "@/components/ui/filter-select";

type Option = { id: string; name: string };

const ALL = "__all__";

export function DashboardFilterBar({ categories }: { categories: Option[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <FilterSelect
        aria-label="Filtrar por categoría"
        value={searchParams.get("category") ?? ALL}
        onValueChange={(value) => updateParam("category", value)}
        options={[
          { value: ALL, label: "Todas las categorías" },
          ...categories.map((category) => ({ value: category.id, label: category.name })),
        ]}
      />

      <FilterSelect
        aria-label="Filtrar por sexo"
        value={searchParams.get("sex") ?? ALL}
        onValueChange={(value) => updateParam("sex", value)}
        options={[
          { value: ALL, label: "Todos los sexos" },
          { value: "Hombre", label: "Hombre" },
          { value: "Mujer", label: "Mujer" },
        ]}
      />
    </div>
  );
}
