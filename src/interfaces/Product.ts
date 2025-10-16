// src/interfaces/Product.ts

export interface SubOpcion {
  nombre: string;
  precioAdicional: number;
}

export interface OpcionSeleccion {
  titulo: string;
  tipo: 'radio' | 'checkbox';
  opciones: SubOpcion[];
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  imagenUrl: string;
  categoria: string; // Hacemos que sea un string para mayor flexibilidad desde Firebase
  disponible: boolean;
  opcionesConfigurables?: OpcionSeleccion[];
}
