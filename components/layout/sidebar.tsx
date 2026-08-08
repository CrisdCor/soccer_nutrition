"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserProfile } from "@/lib/auth/user-profile-context";

type NavItem = {
  label: string;
  href: string;
  adminOnly?: boolean;
};

// Estructura de navegación del MVP (ver orden de prioridad de módulos).
// "Usuarios" solo se muestra a role = 'admin' (el acceso real ya está
// forzado por middleware.ts; esto es solo para no mostrar un enlace muerto).
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Jugadores", href: "/jugadores" },
  { label: "Valoraciones", href: "/valoraciones" },
  { label: "Catálogos", href: "/catalogos", adminOnly: true },
  { label: "Configuración", href: "/configuracion" },
  { label: "Usuarios", href: "/usuarios", adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useUserProfile();

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin");

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Image src="/logo.webp" alt="" width={24} height={24} aria-hidden />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Soccer Nutrition
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
