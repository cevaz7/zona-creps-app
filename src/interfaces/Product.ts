// src/interfaces/Product.ts

export interface Categoria {
  id: string;
  nombre: string;
}

export interface SubOpcion {
  nombre: string;
  precioAdicional: number;
}
export interface LinkedOption {
  groupId: string;
  groupTitle: string; // Guardamos el título para mostrarlo
  includedSubOptions: string[]; // Cuántos de este grupo son "gratis" (0, 1, 2...)
}
export interface OptionGroup {
  id: string;
  titulo: string; // ej. "Sabores de Helado", "Toppings"
  tipo: 'radio' | 'checkbox'; // radio: seleccionar solo uno, checkbox: seleccionar varios
  opciones: SubOpcion[];
  required?: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  imagenUrl: string; // Por ahora un texto plano
  disponible: boolean;

  // Campos de Categoría (guardamos ambos para facilitar consultas)
  categoriaId: string;
  categoriaNombre: string; 

  // Campos de Promociones/Combos
  enPromocion?: boolean;
  precioPromocional?: number;
  productoDelDia?: boolean;
  esCombo?: boolean;

  // --- CAMPO CLAVE ---
  // Un array de IDs que apunta a la colección 'optionGroups'
 linkedOptions?: LinkedOption[];
}