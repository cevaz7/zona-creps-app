// src/app/page.tsx
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import Header from "../components/Header";
import Hero from "../components/Hero";
import MenuSection from "../components/MenuSection";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";

// Función para obtener datos de Firestore
async function getData() {
  try {
    const snapshot = await getDocs(collection(db, "test"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

// Componente de la página principal
export default async function Home() {
  const data = await getData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50">
      <Header />
      <Hero />
      <MenuSection />
      <AboutSection />
      <Footer />
    </div>
  );
}