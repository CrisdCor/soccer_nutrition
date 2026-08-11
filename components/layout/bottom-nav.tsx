"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { AccountMenuContent } from "@/components/layout/account-menu-content";
import { MoreMenuDrawer } from "@/components/layout/more-menu-drawer";
import { getInitials } from "@/lib/auth/format";
import { useUserProfile } from "@/lib/auth/user-profile-context";

const MORE_ITEMS_BASE = [
  { label: "Catálogos", href: "/catalogos" },
  { label: "Configuración", href: "/configuracion" },
];
const USUARIOS_ITEM = { label: "Usuarios", href: "/usuarios" };

/**
 * Barra de navegación inferior, solo mobile (`sm:hidden`, la contraparte
 * exacta del `hidden sm:flex` del Sidebar -- nunca se muestran los dos a
 * la vez). 4 posiciones fijas: Dashboard y Jugadores son los módulos de
 * uso más frecuente (van directo); "Más" agrupa lo que no entra
 * (Catálogos/Configuración/Usuarios, este último solo admin) en un drawer
 * chico; "Perfil" abre el mismo <AccountMenuContent> que el avatar del
 * Header en desktop/tablet -- incluso comparten el componente.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { full_name, role } = useUserProfile();
  const isStaff = role === "admin" || role === "nutricionista";

  const moreItems = role === "admin" ? [...MORE_ITEMS_BASE, USUARIOS_ITEM] : MORE_ITEMS_BASE;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Navegación principal"
    >
      <NavLink href="/dashboard" label="Dashboard" active={pathname.startsWith("/dashboard")} icon={<DashboardIcon />} />
      <NavLink href="/jugadores" label="Jugadores" active={pathname.startsWith("/jugadores")} icon={<PlayersIcon />} />
      {/* Quinta posición condicional (rompe los "4 fijos" a propósito):
          registro de peso es justo el caso de uso "celular en la cancha"
          que el BottomNav existe para servir -- no tiene sentido
          esconderlo en el drawer "Más". Solo admin/nutricionista. */}
      {isStaff && (
        <NavLink href="/pesajes" label="Pesajes" active={pathname.startsWith("/pesajes")} icon={<WeighInIcon />} />
      )}

      <MoreMenuDrawer
        items={moreItems}
        trigger={(active) => (
          <>
            <span className={`text-lg leading-none ${active ? "text-brand-red" : "text-muted"}`} aria-hidden>
              •••
            </span>
            <span className={`text-[10px] ${active ? "font-medium text-brand-red" : "text-muted"}`}>Más</span>
          </>
        )}
      />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button type="button" className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5" aria-label={`Cuenta de ${full_name}`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-[9px] font-semibold text-foreground">
              {getInitials(full_name)}
            </span>
            <span className="text-[10px] text-muted">Perfil</span>
          </button>
        </DropdownMenu.Trigger>
        <AccountMenuContent side="top" />
      </DropdownMenu.Root>
    </nav>
  );
}

function NavLink({ href, label, active, icon }: { href: string; label: string; active: boolean; icon: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5"
    >
      <span className={active ? "text-brand-red" : "text-muted"}>{icon}</span>
      <span className={`text-[10px] ${active ? "font-medium text-brand-red" : "text-muted"}`}>{label}</span>
    </Link>
  );
}

function DashboardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function PlayersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9.5" r="2.5" />
      <path d="M15.5 14.2c2.6.4 4.5 2.6 4.5 5.3" />
    </svg>
  );
}

function WeighInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12a3.5 3.5 0 0 1 7 0" />
      <path d="M12 12v-2.5" />
    </svg>
  );
}
