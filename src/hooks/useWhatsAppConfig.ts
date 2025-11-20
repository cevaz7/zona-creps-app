// src/hooks/useWhatsAppConfig.ts
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface WhatsAppConfig {
  phoneNumber: string;
  lastUpdated: any;
  updatedBy: string;
}

export const useWhatsAppConfig = () => {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    try {
      const docRef = doc(db, 'config', 'whatsapp');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          phoneNumber: data.phoneNumber,
          lastUpdated: data.lastUpdated, // Esto será un Timestamp de Firestore
          updatedBy: data.updatedBy
        });
      } else {
        // Crear configuración por defecto si no existe
        const defaultConfig = {
          phoneNumber: "09999931458",
          lastUpdated: new Date(),
          updatedBy: "system"
        };
        await setDoc(docRef, defaultConfig);
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newPhoneNumber: string, updatedBy: string) => {
    try {
      const updatedConfig = {
        phoneNumber: newPhoneNumber,
        lastUpdated: new Date(), // Usar Date nativo de JavaScript
        updatedBy: updatedBy
      };
      
      await setDoc(doc(db, 'config', 'whatsapp'), updatedConfig);
      setConfig(updatedConfig);
      return true;
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      return false;
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return { config, loading, updateConfig, refreshConfig: loadConfig };
};