// src/components/ProductCard.tsx
import Image from 'next/image';
import { Producto } from '@/interfaces/Product';

interface Props {
  producto: Producto;
}

const ProductCard = ({ producto }: Props) => {
  return (
    // La tarjeta es un contenedor flexible que ocupa toda la altura
    <div className="bg-brand-cream rounded-2xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-all duration-300 flex flex-col border-2 border-transparent hover:border-brand-gold cursor-pointer h-full">
      
      {/* Zona de Imagen con Insignias */}
      <div className="relative w-full h-56">
        <Image
          src={producto.imagenUrl || 'https://placehold.co/600x400/F5EFE6/6B240C?text=Zonaf+Creps'}
          alt={`Imagen de ${producto.nombre}`}
          layout="fill"
          objectFit="cover"
          className="group-hover:scale-110 transition-transform duration-300"
        />
        {/* Insignia de Producto del Día */}
        {producto.productoDelDia && (
          <span className="absolute top-3 left-3 bg-brand-red text-white text-xs font-bold py-1 px-3 rounded-full uppercase tracking-wide shadow-md">
            Del Día
          </span>
        )}
        {/* Insignia de Promoción */}
        {producto.enPromocion && (
          <span className="absolute top-3 right-3 bg-brand-gold text-brand-blue text-xs font-bold py-1 px-3 rounded-full uppercase tracking-wide shadow-md">
            Promo
          </span>
        )}
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-display text-2xl font-bold text-brand-brown truncate">
          {producto.nombre}
        </h3>
        {/* Usamos min-h-[...] para asegurar altura mínima y alinear botones */}
        <p className="font-body text-gray-700 text-sm mt-2 flex-grow min-h-[3rem]">
          {producto.descripcion}
        </p>
        
        {/* Zona de Precio y Botón */}
        <div className="mt-4 flex justify-between items-center">
          
          {/* Lógica de Precios */}
          {producto.enPromocion && producto.precioPromocional && producto.precioPromocional > 0 ? (
            <div className="flex flex-col">
              <p className="font-body text-lg font-bold text-gray-400 line-through">
                ${Number(producto.precioBase).toFixed(2)}
              </p>
              <p className="font-body text-3xl font-black text-brand-red">
                ${Number(producto.precioPromocional).toFixed(2)}
              </p>
            </div>
          ) : (
            <p className="font-body text-3xl font-black text-brand-blue">
              ${Number(producto.precioBase).toFixed(2)}
            </p>
          )}

          {/* El botón ahora solo es visual, ya que toda la tarjeta es un link */}
          <div className="bg-brand-brown text-white font-bold py-3 px-6 rounded-full shadow-md transition-colors duration-200 group-hover:bg-brand-red">
            Ver
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;