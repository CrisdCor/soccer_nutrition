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
  title: "Soccer Nutrition | Independiente Medellín",
  description: "Valoraciones antropométricas de jugadores.",
};

// Layout raíz: solo fuentes + estilos globales. El shell con sidebar/header
// vive en app/(app)/layout.tsx (rutas autenticadas); /login no lo usa.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
