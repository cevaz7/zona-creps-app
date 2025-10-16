// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

// Configuración de la fuente para el cuerpo del texto
const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ['400', '700'],
  variable: '--font-montserrat', // Asignamos una variable CSS
});

// Configuración de la fuente para los títulos
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ['700', '900'],
  variable: '--font-playfair-display', // Asignamos una variable CSS
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZonaF Crep's - Un viaje de sabores..!",
  description: "La mejor experiencia en crepes, waffles, helados y más.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
       <body className={`${montserrat.variable} ${playfairDisplay.variable} font-body bg-brand-cream`}>
        {/* --- 2. ENVOLVEMOS LA APLICACIÓN --- */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}