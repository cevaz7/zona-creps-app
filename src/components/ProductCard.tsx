// src/components/ProductCard.tsx
import Image from 'next/image';
import { Producto } from '@/interfaces/Product';

interface Props {
  producto: Producto;
}

const ProductCard = ({ producto }: Props) => {
  return (
    <div className="bg-brand-cream rounded-2xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-all duration-300 flex flex-col border-2 border-transparent hover:border-brand-gold">
      <div className="relative w-full h-56">
        <Image
          src={producto.imagenUrl || 'https://placehold.co/600x400/F5EFE6/6B240C?text=Zona+Crep\'s'}
          alt={`Imagen de ${producto.nombre}`}
          layout="fill"
          objectFit="cover"
          className="group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-display text-2xl font-bold text-brand-brown truncate">
          {producto.nombre}
        </h3>
        <p className="font-body text-gray-700 text-sm mt-2 flex-grow">
          {producto.descripcion}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <p className="font-body text-3xl font-black text-brand-blue">
            ${Number(producto.precioBase).toFixed(2)}
          </p>
          <button className="bg-brand-red text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-red-700 transition-colors duration-200">
            Ordenar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
