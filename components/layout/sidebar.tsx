"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserProfile } from "@/lib/auth/user-profile-context";

type NavItem = {
  label: string;
  href: string;
  adminOnly?: boolean;
  /** admin o nutricionista -- ni lider (solo lectura en toda la app) ni jugador. */
  staffOnly?: boolean;
};

// Estructura de navegación del MVP (ver orden de prioridad de módulos).
// "Usuarios"/"Catálogos" solo para role = 'admin'; "Pesajes" para
// admin/nutricionista (staffOnly) -- el acceso real ya está forzado en
// proxy.ts, esto es solo para no mostrar enlaces muertos.
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Jugadores", href: "/jugadores" },
  { label: "Pesajes", href: "/pesajes", staffOnly: true },
  { label: "Catálogos", href: "/catalogos", adminOnly: true },
  { label: "Configuración", href: "/configuracion" },
  { label: "Usuarios", href: "/usuarios", adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useUserProfile();

  const items = NAV_ITEMS.filter(
    (item) =>
      (!item.adminOnly || role === "admin") &&
      (!item.staffOnly || role === "admin" || role === "nutricionista")
  );

  return (
    <aside className="hidden sm:flex sm:w-60 sm:flex-col sm:border-r sm:border-border sm:bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Image src="/logo.webp" alt="" width={24} height={24} className="shrink-0" aria-hidden />
        <span className="text-xs font-semibold leading-tight tracking-tight text-foreground">
          Nutrición Fuerzas Básicas
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
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
      </nav>

      <div className="border-t border-border px-5 py-4">
        <p className="text-xs text-muted">Independiente Medellín</p>
      </div>
    </aside>
  );
}
