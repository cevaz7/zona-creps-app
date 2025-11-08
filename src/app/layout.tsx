// src/app/layout.tsx
import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ServiceWorkerInitializer from "@/components/ServiceWorkerInitializer";

// ... (tus fuentes) ...
const montserrat = Montserrat({ subsets: ["latin"], weight: ['400', '700'], variable: '--font-montserrat' });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ['700', '900'], variable: '--font-playfair-display' });

export const metadata = {
  title: "Zonaf Crep's - Un viaje de sabores..!",
  description: "La mejor experiencia en crepes, waffles, helados y más.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} ${playfairDisplay.variable} font-body bg-brand-cream`}>
        
        <AuthProvider>
          <CartProvider> {/* <-- 2. ENVOLVER LA APP */}
            {children}
            <ServiceWorkerInitializer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}