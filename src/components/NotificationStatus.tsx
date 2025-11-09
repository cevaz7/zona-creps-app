// components/NotificationStatus.tsx
import { useNotifications } from '../hooks/useNotifications';

export const NotificationStatus = () => {
  const { 
    token, 
    permission, 
    isSupported, 
    requestPermission, 
    needsUserInteraction,
    
    hardReset,
    browserInfo 
  } = useNotifications();

  

  if (!isSupported) {
    return (
      <div style={{ color: 'red' }}>
        ❌ Tu navegador no soporta notificaciones push
      </div>
    );
  }

  // 🆕 ESTADO: Permisos concedidos pero sin token (necesita regeneración)
  if (permission === 'granted' && !token) {
    return (
      <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
        <strong>🔄 Permisos activos - Generando token...</strong>
        <p>Los permisos están concedidos pero el token se está regenerando.</p>
        <button onClick={requestPermission} style={{ marginTop: '5px' }}>
          Forzar Regeneración
        </button>
      </div>
    );
  }

  if (permission === 'granted' && token) {
    return (
      <div style={{ color: 'green' }}>
        ✅ Notificaciones activas - Token: {token.substring(0, 20)}...
      </div>
    );
  }

  return (
    <div>
      {needsUserInteraction && browserInfo?.isEdge && (
        <div style={{ background: '#e3f2fd', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
          <strong>🔷 Microsoft Edge</strong>
          <p>Para activar notificaciones, haz clic en el botón:</p>
          <button onClick={requestPermission}>
            Activar Notificaciones en Edge
          </button>
        </div>
      )}
      
      {permission === 'default' && !browserInfo?.isEdge && (
        <button onClick={requestPermission}>
          Activar Notificaciones
        </button>
      )}
      
      {permission === 'denied' && (
        <div style={{ background: '#ffeaa7', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
          <strong>⚠️ Permisos denegados</strong>
          <p>Has bloqueado las notificaciones. Para activarlas:</p>
          <ol style={{ textAlign: 'left', margin: '10px 0' }}>
            <li>Haz clic en el icono de candado en la barra de direcciones</li>
            <li>Busca "Notificaciones" en la lista de permisos</li>
            <li>Cambia a "Permitir"</li>
            <li>Recarga la página o haz clic aquí:</li>
          </ol>
          <button onClick={requestPermission}>
            Reintentar Activación
          </button>
        </div>
      )}
    </div>
  );
};