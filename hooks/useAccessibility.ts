'use client';

import { useState, useEffect, useCallback } from 'react';

interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'x-large';
  highContrast: boolean;
  reducedMotion: boolean;
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    highContrast: false,
    reducedMotion: false,
  });

  useEffect(() => {
    // Cargar preferencias guardadas
    const saved = localStorage.getItem('creappsy-accessibility');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading accessibility settings:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Aplicar clases al body
    const body = document.body;
    
    // Tamaño de fuente
    body.classList.remove('font-size-normal', 'font-size-large', 'font-size-x-large');
    body.classList.add(`font-size-${settings.fontSize}`);
    
    // Alto contraste
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    
    // Movimiento reducido
    if (settings.reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
    
    // Guardar preferencias
    localStorage.setItem('creappsy-accessibility', JSON.stringify(settings));
  }, [settings]);

  const toggleFontSize = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      fontSize: prev.fontSize === 'normal' ? 'large' : prev.fontSize === 'large' ? 'x-large' : 'normal'
    }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  return {
    settings,
    toggleFontSize,
    toggleHighContrast,
    toggleReducedMotion,
  };
}
