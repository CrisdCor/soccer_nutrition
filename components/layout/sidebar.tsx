"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUserProfile } from "@/lib/auth/user-profile-context";

type NavItem = {
  label: string;
  href: string;
  adminOnly?: boolean;
  /** admin o nutricionista -- ni lider (solo lectura en toda la app) ni jugador. */
  staffOnly?: boolean;
};

type NavSection = { label: string; items: NavItem[]; defaultOpen: boolean };

// Estructura de navegación del MVP agrupada en 3 secciones colapsables --
// "Usuarios"/"Catálogos" solo para role = 'admin'; "Pesajes" para
// admin/nutricionista (staffOnly) -- el acceso real ya está forzado en
// proxy.ts, esto es solo para no mostrar enlaces muertos. General abre
// expandida (es la sección de uso más frecuente); Reportes/Administración
// arrancan colapsadas.
const NAV_SECTIONS: NavSection[] = [
  {
    label: "General",
    defaultOpen: true,
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Jugadores", href: "/jugadores" },
      { label: "Pesajes", href: "/pesajes", staffOnly: true },
    ],
  },
  {
    label: "Reportes",
    defaultOpen: false,
    items: [{ label: "Generar reporte", href: "/reportes" }],
  },
  {
    label: "Administración",
    defaultOpen: false,
    items: [
      { label: "Catálogos", href: "/catalogos", adminOnly: true },
      { label: "Configuración", href: "/configuracion" },
      { label: "Usuarios", href: "/usuarios", adminOnly: true },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useUserProfile();

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        (!item.adminOnly || role === "admin") &&
        (!item.staffOnly || role === "admin" || role === "nutricionista")
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="hidden sm:flex sm:w-60 sm:flex-col sm:border-r sm:border-border sm:bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Image src="/logo.webp" alt="" width={24} height={24} className="shrink-0" aria-hidden />
        <span className="text-xs font-semibold leading-tight tracking-tight text-foreground">
          Nutrición Fuerzas Básicas
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {sections.map((section) => (
          <SidebarSection key={section.label} section={section} pathname={pathname} />
        ))}
      </nav>

      <div className="border-t border-border px-5 py-4">
        <p className="text-xs text-muted">Independiente Medellín</p>
      </div>
    </aside>
  );
}

/**
 * Colapsable, mismo patrón visual que el chevron de FilterSelect (rota
 * 180°, transition-transform, sin sombras ni animación llamativa) --
 * expandir/colapsar el contenido usa la técnica de grid-template-rows
 * (0fr -> 1fr) para animar hacia "alto automático" sin JS que mida
 * alturas. Estado local (useState): no persiste entre recargas, mismo
 * criterio que el acordeón del Plan Nutricional.
 */
function SidebarSection({
  section,
  pathname,
}: {
  section: NavSection;
  pathname: string;
}) {
  const [open, setOpen] = useState(section.defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
      >
        {section.label}
        <ChevronIcon className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="space-y-1 pb-1 pt-1">
            {section.items.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-brand-red-soft font-medium text-brand-red"
                      : "text-muted hover:bg-background hover:text-foreground",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
