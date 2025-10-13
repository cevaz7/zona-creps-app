// src/app/page.tsx
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";

// Función para obtener datos de Firestore
async function getData() {
  const snapshot = await getDocs(collection(db, "test")); // tu colección
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Componente de la página (Server Component)
export default async function Home() {
  const data = await getData(); // Puedes usar await directo en Server Component

  return (
    <div>
      <h1>Prueba Firestore (Server Component)</h1>
      <ul>
        {data.length > 0 ? (
          data.map((doc: any) => <li key={doc.id}>{doc.name},{doc.lastname}</li>)
        ) : (
          <li>No hay datos</li>
        )}
      </ul>
    </div>
  );
}
