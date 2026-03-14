'use client';

import { useState, useEffect } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface VoiceGuidedInputProps {
  fieldName: string;
  instructions: string[];
  onTranscript: (text: string) => void;
  language?: string;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  hint?: string;
}

export function VoiceGuidedInput({
  fieldName,
  instructions,
  onTranscript,
  language = 'es-ES',
  placeholder,
  rows = 4,
  value,
  onChange,
  hint
}: VoiceGuidedInputProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const { isListening, transcript, error, startListening, stopListening, isSupported } = useVoiceInput(language);

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
    }
  }, [transcript, isListening, onTranscript]);

  const handleStart = () => {
    setShowGuide(true);
    setCurrentStep(0);
    startListening();
  };

  const handleStop = () => {
    stopListening();
    setShowGuide(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isSupported) {
    return (
      <textarea
        name={fieldName}
        id={fieldName}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    );
  }

  return (
    <div className="voice-guided-container">
      <div className="voice-input-wrapper">
        <textarea
          name={fieldName}
          id={fieldName}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={isListening ? 'listening' : ''}
        />
        
        <div className="voice-controls">
          {!isListening ? (
            <button
              type="button"
              onClick={handleStart}
              className="voice-guide-btn"
              title="Iniciar asistente de voz"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
              <span>Dictar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="voice-guide-btn listening"
              title="Detener"
            >
              <span className="voice-wave"></span>
              <span className="voice-wave"></span>
              <span className="voice-wave"></span>
              <span>Escuchando...</span>
            </button>
          )}
        </div>
      </div>

      {hint && <div className="hint">{hint}</div>}

      {showGuide && (
        <div className="voice-guide-panel">
          <div className="guide-header">
            <span className="guide-icon">🎤</span>
            <span className="guide-title">Asistente de Voz</span>
            <button 
              type="button" 
              className="guide-close" 
              onClick={handleStop}
              aria-label="Cerrar asistente"
            >
              ×
            </button>
          </div>
          
          <div className="guide-progress">
            {instructions.map((_, idx) => (
              <div 
                key={idx} 
                className={`progress-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>

          <div className="guide-content">
            <div className="step-number">Paso {currentStep + 1} de {instructions.length}</div>
            <div className="step-instruction">{instructions[currentStep]}</div>
            
            {isListening && (
              <div className="listening-indicator">
                <span className="pulse"></span>
                Hablando... {transcript && <span className="transcript-preview">"{transcript.substring(0, 50)}..."</span>}
              </div>
            )}
          </div>

          <div className="guide-actions">
            <button 
              type="button" 
              className="guide-btn secondary"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              ← Anterior
            </button>
            
            {currentStep < instructions.length - 1 ? (
              <button 
                type="button" 
                className="guide-btn primary"
                onClick={nextStep}
              >
                Siguiente →
              </button>
            ) : (
              <button 
                type="button" 
                className="guide-btn success"
                onClick={handleStop}
              >
                ✓ Finalizar
              </button>
            )}
          </div>

          {error && (
            <div className="guide-error">
              <strong>Error:</strong> {error === 'not-allowed' 
                ? 'Permite el micrófono en la configuración de tu navegador' 
                : 'Intenta de nuevo'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
