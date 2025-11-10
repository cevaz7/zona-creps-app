import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Función para obtener emails de todos los admins
const getAdminEmails = async (): Promise<string[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const adminEmails: string[] = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.role === 'admin' && userData.email) {
        adminEmails.push(userData.email);
        console.log(`👑 Admin encontrado: ${userData.email}`);
      }
    });
    
    return adminEmails;
  } catch (error) {
    console.error('❌ Error obteniendo emails de admin:', error);
    return [];
  }
};

export const sendEmailNotification = async (orderData: any, orderId: string) => {
  try {
    // Obtener emails automáticamente
    const adminEmails = await getAdminEmails();
    
    if (adminEmails.length === 0) {
      console.log('🔕 No se encontraron admins con email');
      return false;
    }

    console.log(`📧 Enviando email a ${adminEmails.length} admin(s) via API...`);

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderData,
        orderId,
        adminEmails
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error enviando email via API:', result.error);
      return false;
    }

    console.log('✅ Email enviado correctamente via API');
    return true;

  } catch (error) {
    console.error('❌ Error en sendEmailNotification:', error);
    return false;
  }
};