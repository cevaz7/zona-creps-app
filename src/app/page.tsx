import { db } from "../../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import Header from "../components/Header";
import Hero from "../components/Hero";
import MenuSection from "../components/MenuSection";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";
import { Producto } from "@/interfaces/Product";

async function getProducts(): Promise<Producto[]> {
  try {
    const productsRef = collection(db, "products"); 
    const q = query(productsRef, where("disponible", "==", true)); // Traemos solo los productos disponibles
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("No se encontraron productos.");
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Producto[];

  } catch (error) {
    console.error("Error al obtener los productos:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-brand-cream">
      <Header />
      <main>
        <Hero />
        <MenuSection productos={products} />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}