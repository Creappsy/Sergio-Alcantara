'use client';

import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useEffect, useState } from 'react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  language?: string;
  className?: string;
}

export function VoiceInputButton({ onTranscript, language = 'es-ES', className = '' }: VoiceInputButtonProps) {
  const { isListening, transcript, error, startListening, stopListening, isSupported } = useVoiceInput(language);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es dispositivo móvil
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
    }
  }, [transcript, isListening, onTranscript]);

  if (!isSupported) {
    return (
      <div className="voice-unsupported" title="Dictado no soportado en este navegador">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
          <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" x2="12" y1="19" y2="22"></line>
        </svg>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      onMouseEnter={() => !isMobile && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      onTouchStart={() => setShowTooltip(true)}
      onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
      className={`voice-input-btn ${isListening ? 'listening' : ''} ${isMobile ? 'mobile' : ''} ${className}`}
      aria-label={isListening ? 'Detener dictado' : 'Iniciar dictado por voz'}
      title={isListening ? 'Detener dictado' : 'Iniciar dictado por voz'}
      style={{ 
        minWidth: isMobile ? '48px' : '44px',
        minHeight: isMobile ? '48px' : '44px'
      }}
    >
      {isListening ? (
        <>
          <span className="voice-wave"></span>
          <span className="voice-wave"></span>
          <span className="voice-wave"></span>
          {isMobile && <span className="mobile-text">Escuchando...</span>}
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" x2="12" y1="19" y2="22"></line>
          </svg>
          {isMobile && <span className="mobile-text">Dictar</span>}
        </>
      )}
      {showTooltip && (
        <span className="voice-tooltip">
          {isListening ? 'Habla ahora...' : 'Toca para dictar'}
        </span>
      )}
      {error && (
        <span className="voice-error">
          Error: {error === 'not-allowed' ? 'Permite el micrófono' : 'Intenta de nuevo'}
        </span>
      )}
    </button>
  );
}
