"use client";

import { useState, useEffect } from 'react';
import { db } from "../../firebase/config";
import { collection, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Producto, Categoria, OptionGroup, LinkedOption } from '@/interfaces/Product';
import { uploadImageToCloudinary } from "@/utils/uploadImageToCloudinary";

interface Props {
  productToEdit: Producto | null;
  onClose: () => void;
}

export default function ProductForm({ productToEdit, onClose }: Props) {
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: '',
    descripcion: '',
    precioBase: 0,
    imagenUrl: '',
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 🔹 FUNCIÓN SEPARADA PARA MANEJAR LA SUBIDA DE IMAGEN
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    
    if (file) {
      setUploadingImage(true);
      try {
        const uploadedUrl = await uploadImageToCloudinary(file);
        setFormData(prev => ({ ...prev, imagenUrl: uploadedUrl }));
      } catch (err) {
        console.error("Error subiendo imagen:", err);
        alert("Error al subir la imagen");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Cargar categorías y grupos de opciones
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
      if (name === 'precioBase' || name === 'precioPromocional') {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
      } else {
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
        newLinkedOptions = [...currentOptions, {
          groupId: group.id,
          groupTitle: group.titulo,
          includedSubOptions: []
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
          const newIncluded = isIncluded
            ? currentIncluded.filter(name => name !== subOptionName)
            : [...currentIncluded, subOptionName];
          return { ...link, includedSubOptions: newIncluded };
        }
        return link;
      });
      return { ...prev, linkedOptions: newLinkedOptions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 🔹 PREPARAR DATOS CON LA URL ACTUAL (ya se actualizó en handleImageChange)
    const productData = { 
      ...formData,
      precioBase: Number(formData.precioBase) || 0,
      precioPromocional: Number(formData.precioPromocional) || 0
    };

    try {
      if (productToEdit) {
        const productRef = doc(db, 'products', productToEdit.id);
        await setDoc(productRef, productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar el producto: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="font-display text-3xl text-brand-brown mb-6">
        {productToEdit ? 'Editar' : 'Crear'} Producto
      </h2>
      
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

        {/* 🔹 CAMPO DE IMAGEN MEJORADO */}
        <div>
          <label className="block text-sm font-bold text-gray-700">Imagen del Producto</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full mt-1 p-2 border rounded"
          />
          {uploadingImage && <p className="text-sm text-gray-500 mt-1">Subiendo imagen...</p>}
          {formData.imagenUrl && (
            <img src={formData.imagenUrl} alt="Vista previa" className="w-32 h-32 object-cover mt-2 rounded-lg" />
          )}
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

        {/* Sección de grupos de opciones */}
        <hr className="my-4" />
        <h3 className="text-xl font-bold text-brand-blue">Vincular Grupos de Opciones</h3>
        <div className="space-y-4">
          {allOptionGroups.map(group => {
            const linkedOption = (formData.linkedOptions || []).find(opt => opt.groupId === group.id);
            const isSelected = !!linkedOption;

            return (
              <div key={group.id} className="p-3 border rounded-lg bg-gray-50">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => handleOptionGroupToggle(group)}
                  /> 
                  <span className="font-semibold text-lg">{group.titulo}</span>
                </label>

                {isSelected && (
                  <div className="mt-3 pl-6 border-l-2 border-brand-gold">
                    <p className="text-sm font-bold text-gray-600 mb-2">Marcar opciones incluidas (gratis):</p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.opciones.map(subOpt => (
                        <label key={subOpt.nombre} className="flex items-center space-x-2 text-sm">
                          <input 
                            type="checkbox"
                            checked={(linkedOption.includedSubOptions || []).includes(subOpt.nombre)}
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
          <button type="submit" disabled={loading || uploadingImage} className="py-2 px-6 bg-brand-red text-white font-bold rounded-lg hover:bg-red-700">
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}


