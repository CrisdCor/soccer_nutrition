import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nutrición Fuerzas Básicas | Independiente Medellín",
  description: "Valoraciones antropométricas de jugadores.",
};

// Layout raíz: solo fuentes + estilos globales. El shell con sidebar/header
// vive en app/(app)/layout.tsx (rutas autenticadas); /login no lo usa.
//
// h-dvh (dynamic viewport height) en vez de h-full/100vh: en mobile, 100vh
// (y el h-full/height:100% heredado del ICB, que históricamente se computa
// igual) no descuenta la barra de direcciones del navegador -- deja html/
// body más altos que el área realmente visible, obligando a scrollear de
// más para llegar al fondo, que es justo donde vive el BottomNav fijo (ver
// components/layout/bottom-nav.tsx). dvh sí seguí el viewport real.
//
// overflow-x-hidden acá es la red de seguridad final contra overflow
// horizontal de página completa: cada fila con contenido más ancho que el
// viewport ya debería contenerse sola (overflow-x-auto puntual, ver
// components/dashboard/filter-bar.tsx y afines), pero si algo se escapa,
// esto lo recorta en vez de dejar que toda la página scrollee lateral.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-dvh overflow-x-hidden antialiased`}
    >
      <body className="h-dvh min-h-dvh overflow-x-hidden bg-background text-foreground">{children}</body>
    </html>
  );
}
