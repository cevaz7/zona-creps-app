// src/components/ProductForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { db } from "../../firebase/config"; // <-- RUTA CORREGIDA
import { collection, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Producto, Categoria, OptionGroup,LinkedOption } from '@/interfaces/Product';

interface Props {
  productToEdit: Producto | null;
  onClose: () => void;
}

export default function ProductForm({ productToEdit, onClose }: Props) {
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: '',
    descripcion: '',
    precioBase: 0,
    imagenUrl: '', // Dejado como texto plano como solicitaste
    categoriaId: '',
    categoriaNombre: '',
    disponible: true,
    enPromocion: false,
    precioPromocional: 0,
    productoDelDia: false,
    esCombo: false,
    linkedOptions: []
  });
  const [allCategories, setAllCategories] = useState<Categoria[]>([]);
  const [allOptionGroups, setAllOptionGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar categorías y grupos de opciones al montar el formulario
  useEffect(() => {
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setAllCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Categoria)));
    });
    const unsubGroups = onSnapshot(collection(db, 'optionGroups'), (snapshot) => {
      setAllOptionGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OptionGroup)));
    });

    if (productToEdit) {
      setFormData(productToEdit);
    }

    return () => {
      unsubCategories();
      unsubGroups();
    };
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      // Si el campo es un precio, guardarlo como número
      if (name === 'precioBase' || name === 'precioPromocional') {
        // Usamos parseFloat para aceptar decimales (ej. 1.50)
        // || 0 para evitar que el valor sea NaN si el campo está vacío
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
      } else {
        // De lo contrario, guardarlo como texto
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const category = allCategories.find(c => c.id === categoryId);
    setFormData(prev => ({
      ...prev,
      categoriaId: categoryId,
      categoriaNombre: category ? category.nombre : '',
    }));
  };

 const handleOptionGroupToggle = (group: OptionGroup) => {
    setFormData(prev => {
      const currentOptions = prev.linkedOptions || [];
      const isSelected = currentOptions.some(opt => opt.groupId === group.id);
      let newLinkedOptions: LinkedOption[];

      if (isSelected) {
        newLinkedOptions = currentOptions.filter(opt => opt.groupId !== group.id);
      } else {
        // Añadimos el grupo con CERO sub-opciones incluidas por defecto
        newLinkedOptions = [...currentOptions, {
          groupId: group.id,
          groupTitle: group.titulo,
          includedSubOptions: [] // ¡Usamos el nuevo array!
        }];
      }
      return { ...prev, linkedOptions: newLinkedOptions };
    });
  };

    const handleIncludedSubOptionToggle = (groupId: string, subOptionName: string) => {
    setFormData(prev => {
      const currentOptions = prev.linkedOptions || [];
      const newLinkedOptions = currentOptions.map(link => {
        if (link.groupId === groupId) {
          const currentIncluded = link.includedSubOptions || [];
          const isIncluded = currentIncluded.includes(subOptionName);
          let newIncluded: string[];

          if (isIncluded) {
            // Si estaba marcada, la quitamos del array
            newIncluded = currentIncluded.filter(name => name !== subOptionName);
          } else {
            // Si no estaba, la añadimos al array
            newIncluded = [...currentIncluded, subOptionName];
          }
          return { ...link, includedSubOptions: newIncluded };
        }
        return link;
      });
      return { ...prev, linkedOptions: newLinkedOptions };
    });
  };
  // Se activa cuando el admin cambia el número de "incluidos"
  const handleIncludedCountChange = (groupId: string, count: number) => {
    setFormData(prev => {
      const currentOptions = prev.linkedOptions || [];
      const newLinkedOptions = currentOptions.map(opt => 
        opt.groupId === groupId 
          ? { ...opt, includedCount: Math.max(0, count) } // Evitamos números negativos
          : opt
      );
      return { ...prev, linkedOptions: newLinkedOptions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productData = { 
      ...formData,
      precioBase: Number(formData.precioBase) || 0,
      precioPromocional: Number(formData.precioPromocional) || 0
    };
    
    try {
      if (productToEdit) {
        // Editar producto existente
        const productRef = doc(db, 'products', productToEdit.id);
        await setDoc(productRef, productData);
      } else {
        // Crear nuevo producto
        await addDoc(collection(db, 'products'), productData);
      }
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Error al guardar el producto: ", error);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="font-display text-3xl text-brand-brown mb-6">{productToEdit ? 'Editar' : 'Crear'} Producto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700">Nombre del Producto</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Descripción</label>
          <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="w-full mt-1 p-2 border rounded"></textarea>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Precio Base ($)</label>
          <input type="number" name="precioBase" value={formData.precioBase} step="0.01" onChange={handleChange} className="w-full mt-1 p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">URL de la Imagen (temporal)</label>
          <input type="text" name="imagenUrl" value={formData.imagenUrl} onChange={handleChange} placeholder="https://..." className="w-full mt-1 p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700">Categoría</label>
          <select name="categoriaId" value={formData.categoriaId} onChange={handleCategoryChange} className="w-full mt-1 p-2 border rounded" required>
            <option value="">Selecciona una categoría</option>
            {allCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
          </select>
        </div>

        <hr className="my-4" />
        <h3 className="text-xl font-bold text-brand-blue">Opciones Adicionales</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2"><input type="checkbox" name="disponible" checked={formData.disponible} onChange={handleChange} /> <span>Disponible</span></label>
          <label className="flex items-center space-x-2"><input type="checkbox" name="productoDelDia" checked={formData.productoDelDia} onChange={handleChange} /> <span>Producto del Día</span></label>
          <label className="flex items-center space-x-2"><input type="checkbox" name="esCombo" checked={formData.esCombo} onChange={handleChange} /> <span>Es un Combo</span></label>
          <label className="flex items-center space-x-2"><input type="checkbox" name="enPromocion" checked={formData.enPromocion} onChange={handleChange} /> <span>En Promoción</span></label>
        </div>
        {formData.enPromocion && (
          <div>
            <label className="block text-sm font-bold text-gray-700">Precio Promocional ($)</label>
            <input type="number" name="precioPromocional" value={formData.precioPromocional} step="0.01" onChange={handleChange} className="w-full mt-1 p-2 border rounded" />
          </div>
        )}

       <hr className="my-4" />
        {/* --- ¡SECCIÓN DEL FORMULARIO ACTUALIZADA! --- */}
       <h3 className="text-xl font-bold text-brand-blue">Vincular Grupos de Opciones</h3>
        <p className="text-sm text-gray-600 mb-2">
          Marca un grupo para vincularlo. Luego, marca las sub-opciones que serán <strong>gratuitas</strong> (incluidas) para este producto.
        </p>
        <div className="space-y-4">
          {allOptionGroups.map(group => {
            const linkedOption = (formData.linkedOptions || []).find(opt => opt.groupId === group.id);
            const isSelected = !!linkedOption;

            return (
              <div key={group.id} className="p-3 border rounded-lg bg-gray-50">
                {/* 1. CHECKBOX PARA VINCULAR EL GRUPO ENTERO */}
                <div className="flex justify-between items-center">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handleOptionGroupToggle(group)}
                    /> 
                    <span className="font-semibold text-lg">{group.titulo}</span>
                  </label>
                </div>
                
                {/* 2. SI EL GRUPO ESTÁ VINCULADO, MOSTRAMOS SUS SUB-OPCIONES */}
                {isSelected && (
                  <div className="mt-3 pl-6 border-l-2 border-brand-gold">
                    <p className="text-sm font-bold text-gray-600 mb-2">Marcar opciones incluidas (gratis):</p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.opciones.map(subOpt => (
                        <label key={subOpt.nombre} className="flex items-center space-x-2 text-sm">
                          <input 
                            type="checkbox"
                            // Verificamos si el nombre está en nuestro array de 'includedSubOptions'
                            checked={(linkedOption.includedSubOptions || []).includes(subOpt.nombre)}
                            // Al cambiar, llamamos a la nueva función
                            onChange={() => handleIncludedSubOptionToggle(group.id, subOpt.nombre)}
                          />
                          <span>{subOpt.nombre} (+${subOpt.precioAdicional.toFixed(2)})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onClose} disabled={loading} className="py-2 px-4 bg-gray-200 rounded-lg">Cancelar</button>
          <button type="submit" disabled={loading} className="py-2 px-6 bg-brand-red text-white font-bold rounded-lg hover:bg-red-700">
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
