// src/app/producto/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../../firebase/config';
import { doc, getDoc, collection, getDocs, query, where, documentId, limit } from 'firebase/firestore';
import { Producto, OptionGroup, LinkedOption } from '@/interfaces/Product';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

type SelectedOptions = {
  [groupId: string]: string | string[];
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { addToCart } = useCart(); 

  const [product, setProduct] = useState<Producto | null>(null);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [errors, setErrors] = useState<{[groupId: string]: string}>({});
  const [canAddToCart, setCanAddToCart] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const getProductData = async () => {
      setLoading(true);
      setRelatedProducts([]);
      const productRef = doc(db, 'products', id);
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) { setLoading(false); setProduct(null); return; }
      const productData = { id: productSnap.id, ...productSnap.data() } as Producto;
      setProduct(productData);
      const basePrice = productData.enPromocion && productData.precioPromocional ? Number(productData.precioPromocional) : Number(productData.precioBase);
      setTotalPrice(basePrice);
      if (productData.linkedOptions && productData.linkedOptions.length > 0) {
        const groupIds = productData.linkedOptions.map(opt => opt.groupId);
        const groupsRef = collection(db, 'optionGroups');
        const q = query(groupsRef, where(documentId(), 'in', groupIds));
        const groupsSnap = await getDocs(q);
        setOptionGroups(groupsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as OptionGroup)));
      }
      if (productData.categoriaId) {
        const relatedRef = collection(db, 'products');
        const qRelated = query(relatedRef, where("categoriaId", "==", productData.categoriaId), where(documentId(), "!=", productData.id), limit(3));
        const relatedSnap = await getDocs(qRelated);
        setRelatedProducts(relatedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producto)));
      }
      setLoading(false);
    };
    getProductData();
  }, [id]);

  // Validar opciones obligatorias
useEffect(() => {
  if (!product || optionGroups.length === 0) {
    setCanAddToCart(true);
    return;
  }

  // Usar setTimeout para evitar race conditions
  const timeoutId = setTimeout(() => {
    const newErrors: {[groupId: string]: string} = {};
    let isValid = true;

    optionGroups.forEach(group => {
      const linkRule = (product.linkedOptions || []).find(opt => opt.groupId === group.id);
      
      if (linkRule) {
        const currentSelection = selectedOptions[group.id];
        const selectionCount = Array.isArray(currentSelection) 
          ? currentSelection.length 
          : (currentSelection ? 1 : 0);

        const minSelections = linkRule.minSelections || (group.tipo === 'radio' ? 1 : 0);
        
        console.log(`VALIDACIÓN: ${group.titulo}, Selecciones: ${selectionCount}, Mínimo: ${minSelections}, Válido: ${selectionCount >= minSelections}`);

        // Validar mínimo
        if (selectionCount < minSelections) {
          newErrors[group.id] = `Debes seleccionar al menos ${minSelections} opción(es) de ${group.titulo}`;
          isValid = false;
        }

        // Validar máximo
        const maxSelections = linkRule.maxSelections || (group.tipo === 'radio' ? 1 : 10);
        if (selectionCount > maxSelections) {
          newErrors[group.id] = `Puedes seleccionar máximo ${maxSelections} opción(es) de ${group.titulo}`;
          isValid = false;
        }
      }
    });

    console.log('RESULTADO VALIDACIÓN:', { isValid, errors: newErrors });
    setErrors(newErrors);
    setCanAddToCart(isValid);
  }, 10); // Pequeño delay para evitar race condition

  return () => clearTimeout(timeoutId);
}, [selectedOptions, optionGroups, product]);

  // useEffect de Precios - NUEVA LÓGICA
  useEffect(() => {
    if (!product) return;
    
    let newTotal = product.enPromocion && product.precioPromocional 
      ? Number(product.precioPromocional) 
      : Number(product.precioBase);
      
    for (const groupId in selectedOptions) {
      const linkRule = (product.linkedOptions || []).find(opt => opt.groupId === groupId);
      const groupData = optionGroups.find(g => g.id === groupId);
      
      if (!linkRule || !groupData) continue;
      
      const selections = selectedOptions[groupId];
      const includedCount = linkRule.includedCount || 0;
      
      if (Array.isArray(selections)) {
        // Para checkbox: las primeras 'includedCount' son gratis, las demás se pagan
        selections.forEach((optionName, index) => {
          if (index >= includedCount) {
            const optionData = groupData.opciones.find(o => o.nombre === optionName);
            if (optionData) {
              newTotal += Number(optionData.precioAdicional);
            }
          }
        });
      } else {
        // Para radio: si hay includedCount > 0, es gratis, sino se paga
        if (includedCount === 0 && selections) {
          const optionData = groupData.opciones.find(o => o.nombre === selections);
          if (optionData) {
            newTotal += Number(optionData.precioAdicional);
          }
        }
        // Si includedCount > 0, la selección radio es gratis
      }
    }
    
    setTotalPrice(newTotal * quantity);
  }, [selectedOptions, quantity, product, optionGroups]);

  // Agrega esto después del useEffect de validación para ver qué está pasando:
useEffect(() => {
  console.log('Estado de validación:', {
    canAddToCart,
    errors,
    selectedOptions,
    productLinkedOptions: product?.linkedOptions
  });
}, [canAddToCart, errors, selectedOptions, product]);

  const handleOptionChange = (groupId: string, optionName: string, type: 'radio' | 'checkbox') => {
    setSelectedOptions(prev => {
      const newSelections = { ...prev };
      if (type === 'radio') {
        newSelections[groupId] = optionName;
      } else {
        const currentSelection = (newSelections[groupId] as string[]) || [];
        if (currentSelection.includes(optionName)) {
          newSelections[groupId] = currentSelection.filter(name => name !== optionName);
        } else {
          newSelections[groupId] = [...currentSelection, optionName];
        }
      }
      return newSelections;
    });
  };

const handleAddToCart = () => {
  if (!product) return;
  
  // Validar NUEVAMENTE antes de agregar (doble verificación)
  let finalIsValid = true;
  const finalErrors: {[groupId: string]: string} = {};

  optionGroups.forEach(group => {
    const linkRule = (product.linkedOptions || []).find(opt => opt.groupId === group.id);
    
    if (linkRule) {
      const currentSelection = selectedOptions[group.id];
      const selectionCount = Array.isArray(currentSelection) 
        ? currentSelection.length 
        : (currentSelection ? 1 : 0);

      const minSelections = linkRule.minSelections || (group.tipo === 'radio' ? 1 : 0);
      
      if (selectionCount < minSelections) {
        finalErrors[group.id] = `Debes seleccionar al menos ${minSelections} opción(es) de ${group.titulo}`;
        finalIsValid = false;
      }
    }
  });

  if (!finalIsValid) {
    setErrors(finalErrors);
    alert('Por favor completa todas las opciones obligatorias antes de agregar al carrito');
    return;
  }
    
  // Crear selectedOptions con títulos en lugar de IDs
  const selectedOptionsWithTitles: any = {};
  
  Object.entries(selectedOptions).forEach(([groupId, value]) => {
    const group = optionGroups.find(g => g.id === groupId);
    const groupTitle = group?.titulo || groupId;
    selectedOptionsWithTitles[groupTitle] = value;
  });
  
  addToCart({ 
    product, 
    quantity, 
    selectedOptions: selectedOptionsWithTitles,
    totalPrice 
  });
  
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <p className="font-display text-2xl text-brand-brown animate-pulse">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
       <div className="bg-brand-cream min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
          <h1 className="font-display text-4xl text-brand-brown font-bold">¡Oh no!</h1>
          <p className="text-gray-600 mt-4 text-lg">No pudimos encontrar el producto que estás buscando.</p>
          <Link href="/tienda" className="mt-8 inline-block bg-brand-red text-white font-bold py-3 px-6 rounded-full hover:bg-red-700">
            Volver a la tienda
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen">
      <Header />
      <main className="container mx-auto px-16 py-20">
        <div className="bg-white p-8 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Columna de Imagen */}
          <div>
            <Image 
              src={product.imagenUrl || 'https://placehold.co/600x400/F5EFE6/6B240C?text=Zonaf+Creps'}
              alt={product.nombre}
              width={600}
              height={600}
              className="rounded-lg object-cover w-full aspect-square"
            />
          </div>

          {/* Columna de Configuración */}
          <div className="flex flex-col">
            <h1 className="font-display text-4xl text-brand-brown font-bold">{product.nombre}</h1>
            <p className="text-gray-600 mt-4 text-lg">{product.descripcion}</p>
            <div className="my-6 border-t border-gray-200"></div>

            {/* Sección de Opciones - CORREGIDA */}
            <div className="space-y-6">
              {optionGroups.map(group => {
                const linkRule = (product.linkedOptions || []).find(opt => opt.groupId === group.id);
                
                // NUEVA LÓGICA: Calcular texto de opciones incluidas
                let includedText = '';
                if (linkRule) {
                  const includedCount = linkRule.includedCount || 0;
                  if (includedCount > 0) {
                    if (group.tipo === 'radio') {
                      includedText = '(Incluye 1 opción)';
                    } else {
                      includedText = `(Incluye ${includedCount} opción(es))`;
                    }
                  }
                }

                return (
                  <div key={group.id}>
                    <h3 className="font-bold text-xl text-brand-blue mb-3">
                      {group.titulo} 
                      <span className="text-sm font-normal text-gray-500 ml-2">{includedText}</span>
                      {linkRule?.minSelections && (
                        <span className="text-xs text-red-500 ml-1">
                          * (Mínimo: {linkRule.minSelections})
                        </span>
                      )}
                    </h3>
                    
                    {/* Mostrar error si existe */}
                    {errors[group.id] && (
                      <p className="text-red-500 text-sm mb-2 bg-red-50 p-2 rounded border border-red-200">
                        ⚠️ {errors[group.id]}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {group.opciones.map(option => {
                        // NUEVA LÓGICA: Determinar si la opción es gratis o pagada
                        let isIncluded = false;
                        let displayPrice = Number(option.precioAdicional);
                        
                        if (linkRule) {
                          const includedCount = linkRule.includedCount || 0;
                          
                          if (group.tipo === 'checkbox') {
                            // En checkbox: las primeras 'includedCount' selecciones son gratis
                            const currentSelections = (selectedOptions[group.id] as string[]) || [];
                            const optionIndex = currentSelections.indexOf(option.nombre);
                            isIncluded = optionIndex < includedCount && optionIndex !== -1;
                          } else {
                            // En radio: si hay opciones incluidas, todas son gratis
                            isIncluded = includedCount > 0;
                          }
                          
                          displayPrice = isIncluded ? 0 : Number(option.precioAdicional);
                        }
                        
                        return (
                          <label key={option.nombre} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type={group.tipo}
                              name={group.id}
                              onChange={() => handleOptionChange(group.id, option.nombre, group.tipo)}
                              className={group.tipo === 'radio' ? 'form-radio text-brand-red' : 'form-checkbox text-brand-red'}
                            />
                            <span className="ml-3 text-gray-700">{option.nombre}</span>
                            
                            {isIncluded ? (
                              <span className="ml-auto text-sm text-green-600 font-semibold">Incluido</span>
                            ) : (
                              <span className="ml-auto text-sm text-brand-red font-semibold">
                                {displayPrice > 0 ? `+$${displayPrice.toFixed(2)}` : 'Gratis'}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="my-6 border-t border-gray-200"></div>

            {/* Cantidad, Precio, Botón */}
            <div className="flex justify-between items-center mt-auto">
              <input 
                type="number" 
                value={quantity} 
                min="1" 
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                className="w-20 p-3 border rounded-lg text-center font-bold" 
              />
              <div className="text-right">
                <span className="text-gray-500">Total</span>
                <p className="font-display text-4xl text-brand-red font-bold">${totalPrice.toFixed(2)}</p>
              </div>
            </div>
            
            <button 
              onClick={handleAddToCart} 
              disabled={!canAddToCart}
              className={`w-full font-bold text-lg py-4 rounded-full mt-6 transition-colors ${
                canAddToCart 
                  ? 'bg-brand-red text-white hover:bg-red-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canAddToCart ? 'Añadir al Carrito' : 'Selecciona las opciones obligatorias'}
            </button>
          </div>
        </div>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl text-brand-brown font-bold mb-8">También te podría gustar...</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map(related => (
                <Link href={`/producto/${related.id}`} key={related.id} className="h-full">
                  <ProductCard producto={related} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}