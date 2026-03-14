'use client';

import { useState, useEffect } from 'react';

export function VoiceInstructions() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const android = /Android/i.test(ua);
    
    setIsMobile(mobile);
    setIsAndroid(android);
    
    // Mostrar solo en primera visita desde móvil
    const hasSeenInstructions = localStorage.getItem('creappsy-voice-instructions');
    if (mobile && !hasSeenInstructions) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('creappsy-voice-instructions', 'true');
  };

  if (!isVisible || !isMobile) return null;

  return (
    <div className="voice-instructions-overlay" onClick={handleClose}>
      <div className="voice-instructions-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose} aria-label="Cerrar">×</button>
        
        <div className="icon">🎤</div>
        <h2>¡Nuevo: Dictado por Voz!</h2>
        
        {isAndroid ? (
          <>
            <p>
              Ahora puedes completar el formulario hablando en lugar de escribir.
            </p>
            <ol>
              <li>
                <strong>Toca el botón del micrófono</strong> junto a cualquier campo de texto
              </li>
              <li>
                <strong>Permite el acceso</strong> cuando el navegador pida permiso para usar el micrófono
              </li>
              <li>
                <strong>Habla claramente</strong> en español
              </li>
              <li>
                <strong>Toca de nuevo</strong> para detener cuando termines
              </li>
            </ol>
            <div className="tip">
              <strong>💡 Consejo:</strong> Si Chrome te pide permiso, selecciona "Permitir". 
              Puedes usarlo en los campos de biografía, notas y cualquier texto largo.
            </div>
          </>
        ) : (
          <>
            <p>
              Completa el formulario hablando en lugar de escribir.
            </p>
            <ol>
              <li>Toca el botón 🎤 junto a los campos de texto</li>
              <li>Habla claramente</li>
              <li>Toca de nuevo para detener</li>
            </ol>
          </>
        )}
        
        <button className="btn-primary" onClick={handleClose}>
          Entendido, ¡probarlo!
        </button>
      </div>
    </div>
  );
}
