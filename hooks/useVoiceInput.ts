'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

export function useVoiceInput(language: string = 'es-ES'): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Verificar soporte de Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        
        // Configuración optimizada para móviles Android
        recognitionRef.current.continuous = false; // Mejor para móviles
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;
        
        // Configuración adicional para Android
        if ('maxAlternatives' in recognitionRef.current) {
          recognitionRef.current.maxAlternatives = 1;
        }

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
          }
          
          // Reset timeout en cada resultado
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          // No mostrar error si es 'aborted' (el usuario detuvo manualmente)
          if (event.error !== 'aborted') {
            setError(event.error);
          }
          
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
        
        // Para Android: manejar timeout de silencio
        recognitionRef.current.onspeechend = () => {
          timeoutRef.current = setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }, 2000);
        };
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignorar errores al limpiar
        }
      }
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setError(null);
      setTranscript('');
      try {
        // En Android, a veces es necesario reiniciar
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
          setIsListening(true);
        }, 100);
      } catch (err) {
        // Si falla al reiniciar, intentar iniciar directamente
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err2) {
          setError('Error al iniciar el reconocimiento de voz. Intenta de nuevo.');
        }
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignorar errores
      }
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported,
  };
}
