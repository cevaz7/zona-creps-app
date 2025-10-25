// src/components/OptionGroupManager.tsx
"use client";

import { useState, useEffect } from 'react';
import { db } from "../../firebase/config"; // Tu ruta
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { OptionGroup, SubOpcion } from '@/interfaces/Product';

export default function OptionGroupManager() {
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<'radio' | 'checkbox'>('radio');
  const [subOptions, setSubOptions] = useState<SubOpcion[]>([]);
  
  const [subOptionName, setSubOptionName] = useState('');
  const [subOptionPrice, setSubOptionPrice] = useState(0);
  
  // --- ¡NUEVO ESTADO! Para saber qué sub-opción estamos editando ---
  const [editingSubOptionIndex, setEditingSubOptionIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'optionGroups'), (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OptionGroup));
      setGroups(groupsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEditGroup = (group: OptionGroup) => {
    setEditingGroup(group);
    setGroupName(group.titulo);
    setGroupType(group.tipo);
    setSubOptions(group.opciones);
    setEditingSubOptionIndex(null); // Reseteamos la edición de sub-opciones
  };

  const cancelEditGroup = () => {
    setEditingGroup(null);
    setGroupName('');
    setGroupType('radio');
    setSubOptions([]);
    setSubOptionName('');
    setSubOptionPrice(0);
    setEditingSubOptionIndex(null);
  };

  // --- ¡NUEVA FUNCIÓN! Para empezar a editar una sub-opción ---
  const handleEditSubOption = (index: number) => {
    setEditingSubOptionIndex(index); // Guardamos el índice
    const subOpt = subOptions[index]; // Obtenemos la sub-opción
    setSubOptionName(subOpt.nombre); // Llenamos el input de nombre
    setSubOptionPrice(subOpt.precioAdicional); // Llenamos el input de precio
  };
  
  // --- ¡NUEVA FUNCIÓN! Para cancelar la edición de sub-opción ---
  const cancelEditSubOption = () => {
    setEditingSubOptionIndex(null); // Limpiamos el índice
    setSubOptionName(''); // Limpiamos el input de nombre
    setSubOptionPrice(0); // Limpiamos el input de precio
  };

  // --- FUNCIÓN ACTUALIZADA: Añade o Actualiza sub-opción ---
  const handleAddOrUpdateSubOption = () => {
    if (subOptionName.trim() === '') return;

    const newSubOptData = { nombre: subOptionName.trim(), precioAdicional: subOptionPrice };

    if (editingSubOptionIndex !== null) {
      // --- Modo Edición de Sub-Opción ---
      // 1. Validar que el nuevo nombre no exista ya (excluyendo el actual)
      const isDuplicate = subOptions.some((opt, index) => 
        index !== editingSubOptionIndex && opt.nombre.toLowerCase() === newSubOptData.nombre.toLowerCase()
      );
      if (isDuplicate) {
        alert("Ya existe otra opción con este nombre.");
        return;
      }
      // 2. Actualizamos la sub-opción en el array
      const updatedSubOptions = subOptions.map((opt, index) => 
        index === editingSubOptionIndex ? newSubOptData : opt
      );
      setSubOptions(updatedSubOptions);
      cancelEditSubOption(); // Salimos del modo edición de sub-opción
    
    } else {
      // --- Modo Añadir Sub-Opción ---
      // 1. Validar que no exista ya
       const isDuplicate = subOptions.some(opt => opt.nombre.toLowerCase() === newSubOptData.nombre.toLowerCase());
       if (isDuplicate) {
         alert("Ya existe una opción con este nombre.");
         return;
       }
      // 2. Añadimos la nueva sub-opción
      setSubOptions([...subOptions, newSubOptData]);
      // Limpiamos solo los inputs, no salimos del modo edición general
      setSubOptionName('');
      setSubOptionPrice(0);
    }
  };

  const handleRemoveSubOption = (indexToRemove: number) => {
    // Si estamos editando la sub-opción que se va a borrar, cancelamos la edición
    if(editingSubOptionIndex === indexToRemove){
      cancelEditSubOption();
    }
    setSubOptions(subOptions.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveGroup = async () => {
    // ... (Lógica de validación y guardado sin cambios) ...
    if (groupName.trim() === '' || subOptions.length === 0) {
      alert("El grupo debe tener un nombre y al menos una opción.");
      return;
    }
    const groupData = { titulo: groupName.trim(), tipo: groupType, opciones: subOptions };
    try {
      if (editingGroup) {
        const groupRef = doc(db, 'optionGroups', editingGroup.id);
        await setDoc(groupRef, groupData);
        alert("Grupo actualizado con éxito!");
      } else {
        await addDoc(collection(db, 'optionGroups'), groupData);
        alert("Grupo creado con éxito!");
      }
      cancelEditGroup(); // Limpia todo el formulario
    } catch (error) {
      console.error("Error al guardar grupo: ", error);
      alert("Error al guardar el grupo.");
    }
  };

  const handleDeleteGroup = async (id: string) => {
    // ... (Lógica de borrado sin cambios) ...
    if (editingGroup?.id === id) { cancelEditGroup(); }
    if (confirm("¿Seguro que quieres eliminar este grupo de opciones? Esto podría afectar a los productos que lo usan.")) {
      await deleteDoc(doc(db, 'optionGroups', id));
    }
  };

  if (loading) return <p>Cargando grupos de opciones...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestionar Grupos de Opciones</h2>
      
      {/* FORMULARIO (Crear o Editar Grupo) */}
      <div className="border p-4 rounded-lg space-y-3 mb-6 bg-gray-50">
        <h3 className="text-xl font-bold text-brand-blue">
          {editingGroup ? `Editando Grupo: ${editingGroup.titulo}` : 'Crear Nuevo Grupo'}
        </h3>
        {/* Campos del Grupo */}
        <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Título del Grupo" className="w-full p-2 border rounded-lg" />
        <select value={groupType} onChange={(e) => setGroupType(e.target.value as any)} className="w-full p-2 border rounded-lg">
          <option value="radio">Selección Única</option>
          <option value="checkbox">Selección Múltiple</option>
        </select>

        {/* --- FORMULARIO PARA AÑADIR/EDITAR SUB-OPCIONES (Actualizado) --- */}
        <div className="p-3 bg-white rounded-lg border">
          <h4 className="font-semibold mb-2 text-gray-700">
             {editingSubOptionIndex !== null ? 'Editando Opción:' : 'Opciones dentro del Grupo:'}
          </h4>
          {/* Lista de sub-opciones actuales */}
          <ul className="mb-3 text-sm space-y-1 max-h-40 overflow-y-auto">
            {subOptions.map((opt, index) => (
              <li key={index} className={`flex justify-between items-center p-1 rounded ${editingSubOptionIndex === index ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                <span>- {opt.nombre} (${opt.precioAdicional.toFixed(2)})</span>
                <div className="flex gap-2">
                  {/* Botón Editar Sub-Opción */}
                  <button type="button" onClick={() => handleEditSubOption(index)} className="text-blue-600 text-xs font-bold px-2 hover:underline disabled:opacity-50" disabled={editingSubOptionIndex !== null}>Editar</button>
                  {/* Botón Quitar Sub-Opción */}
                  <button type="button" onClick={() => handleRemoveSubOption(index)} className="text-red-500 text-xs font-bold px-2 hover:underline disabled:opacity-50" disabled={editingSubOptionIndex !== null}>Quitar</button>
                </div>
              </li>
            ))}
             {subOptions.length === 0 && <p className="text-xs text-gray-500 italic">Aún no hay opciones.</p>}
          </ul>
          
          {/* Inputs para añadir/editar */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
            <input type="text" value={subOptionName} onChange={(e) => setSubOptionName(e.target.value)} placeholder="Nombre Opción (ej. 'Fresa')" className="flex-grow p-2 border rounded-lg" />
            <input type="number" value={subOptionPrice} onChange={(e) => setSubOptionPrice(Number(e.target.value))} placeholder="Precio Adicional" className="w-full sm:w-28 p-2 border rounded-lg" />
            {/* El botón ahora es dinámico */}
            <button 
              type="button" 
              onClick={handleAddOrUpdateSubOption} 
              className={`font-bold py-2 px-3 rounded-lg text-white ${editingSubOptionIndex !== null ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {editingSubOptionIndex !== null ? '✓' : '+'} 
            </button>
            {/* Botón para cancelar edición de sub-opción */}
            {editingSubOptionIndex !== null && (
               <button type="button" onClick={cancelEditSubOption} className="bg-gray-400 text-white font-bold py-2 px-3 rounded-lg hover:bg-gray-500">X</button>
            )}
          </div>
        </div>
        {/* --- FIN FORMULARIO SUB-OPCIONES --- */}
        
        {/* Botones Guardar Grupo / Cancelar Edición Grupo */}
        <div className="flex justify-end gap-3 pt-3">
            {editingGroup && (
                <button type="button" onClick={cancelEditGroup} className="py-2 px-4 bg-gray-300 rounded-lg font-medium hover:bg-gray-400">Cancelar Edición Grupo</button>
            )}
            <button onClick={handleSaveGroup} className="py-2 px-6 bg-brand-red text-white font-bold rounded-lg hover:bg-red-700">
                {editingGroup ? 'Actualizar Grupo' : 'Guardar Grupo Nuevo'}
            </button>
        </div>
      </div>

      {/* Lista de grupos existentes */}
      <div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">Grupos Existentes</h3>
        {groups.length === 0 && !loading && <p className="text-gray-500 italic">No hay grupos creados.</p>}
        <ul className="space-y-2">
          {groups.map(group => (
            <li key={group.id} className="border p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">{group.titulo} ({group.tipo})</span>
                <div className="flex gap-3 text-sm">
                    {/* El botón Editar ahora llama a handleEditGroup */}
                    <button onClick={() => handleEditGroup(group)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => handleDeleteGroup(group.id)} className="text-red-600 hover:underline">Eliminar</button>
                </div>
              </div>
              <ul className="text-sm pl-4 list-disc list-inside">
                {group.opciones.map((opt, i) => <li key={i}>{opt.nombre} (+${opt.precioAdicional.toFixed(2)})</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}