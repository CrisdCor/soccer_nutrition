"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
};

// Estructura de navegación del MVP (ver orden de prioridad de módulos).
// Los enlaces existen ya como shell; las páginas se implementan en los
// siguientes pasos de desarrollo.
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Jugadores", href: "/jugadores" },
  { label: "Valoraciones", href: "/valoraciones" },
  { label: "Catálogos", href: "/catalogos" },
  { label: "Configuración", href: "/configuracion" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <span className="h-2 w-2 rounded-full bg-brand-red" aria-hidden />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Soccer Nutrition
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center rounded-md border px-3 py-2 text-sm transition-colors",
                isActive
                  ? "border-brand-red-soft bg-brand-red-soft font-medium text-brand-red"
                  : "border-transparent text-muted hover:border-border hover:bg-background hover:text-foreground",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-5 py-4">
        <p className="text-xs text-muted">Independiente Medellín</p>
      </div>
    </aside>
  );
}
