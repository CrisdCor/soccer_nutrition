import { CatalogSection } from "@/components/catalogos/catalog-section";
import {
  createCategory,
  createPosition,
  toggleCategoryActive,
  togglePositionActive,
} from "@/lib/catalogos/actions";
import { listCategories, listPositions } from "@/lib/catalogos/queries";

export default async function CatalogosPage() {
  const [positions, categories] = await Promise.all([listPositions(), listCategories()]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Catálogos</h2>
        <p className="text-sm text-muted">
          Solo lectura para nutricionista; crear/desactivar es exclusivo de admin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CatalogSection
          title="Posiciones"
          items={positions}
          createAction={createPosition}
          toggleAction={togglePositionActive}
        />
        <CatalogSection
          title="Categorías"
          items={categories}
          createAction={createCategory}
          toggleAction={toggleCategoryActive}
        />
      </div>
    </div>
  );
}
