// src/app/layout.tsx
import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import ServiceWorkerInitializer from "@/components/ServiceWorkerInitializer";
import NotificationPermission from "@/components/NotificationPermission"; // 🆕 IMPORTAR
import NotificationInitializer from "@/components/NotificationInitializer"; // 🆕 IMPORTAR
import LocalBusinessSchema from "@/components/LocalBusinessSchema";

const montserrat = Montserrat({ 
  subsets: ["latin"], 
  weight: ['400', '700'], 
  variable: '--font-montserrat' 
});

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"], 
  weight: ['700', '900'], 
  variable: '--font-playfair-display' 
});

export const metadata = {
  title: "Zonaf Crep's Mojor – Crepes, Waffles y Frappés",
  description:
    "Crepes, waffles, frappés, helados y más en Mojor. Delivery rápido, sabores increíbles y combos especiales todos los días.",
  keywords: [
    "crepes",
    "waffles",
    "frappés",
    "helados",
    "postres",
    "Mojor",
    "Zonaf Creps Mojor",
    "crepes Ecuador",
    "waffles Ecuador",
    "postres Mojor",
  ],
  openGraph: {
    title: "Zonaf Crep's Mojor",
    description:
      "Las mejores crepes, waffles y frappés en Mojor 🇪🇨. Calidad, sabor y delivery rápido.",
    url: "https://zonafcrepsmojor.ec",
    siteName: "Zonaf Crep's Mojor",
    images: [
      {
        url: "/logoheader.jpg", // asegúrate que exista en /public
        width: 800,
        height: 600,
      },
    ],
    locale: "es_EC",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} ${playfairDisplay.variable} font-body bg-brand-cream`}>
        <AuthProvider>
          <CartProvider>
            <LocalBusinessSchema />
            <footer>
              <NotificationPermission />
              <NotificationInitializer/>
            </footer>
            
            {children}
            <ServiceWorkerInitializer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}