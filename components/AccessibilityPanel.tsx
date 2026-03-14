'use client';

import { useAccessibility } from '@/hooks/useAccessibility';

export function AccessibilityPanel() {
  const { settings, toggleFontSize, toggleHighContrast, toggleReducedMotion } = useAccessibility();

  const fontSizeLabels = {
    'normal': 'A',
    'large': 'A+',
    'x-large': 'A++'
  };

  return (
    <div className="accessibility-panel" role="region" aria-label="Opciones de accesibilidad">
      <button
        onClick={toggleFontSize}
        className="a11y-btn"
        aria-label={`Tamaño de fuente: ${settings.fontSize}`}
        title="Cambiar tamaño de fuente"
      >
        <span className="a11y-icon">{fontSizeLabels[settings.fontSize]}</span>
        <span className="a11y-label">Texto</span>
      </button>

      <button
        onClick={toggleHighContrast}
        className={`a11y-btn ${settings.highContrast ? 'active' : ''}`}
        aria-pressed={settings.highContrast}
        aria-label="Alto contraste"
        title="Alternar alto contraste"
      >
        <span className="a11y-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20" fill="currentColor"></path>
          </svg>
        </span>
        <span className="a11y-label">Contraste</span>
      </button>

      <button
        onClick={toggleReducedMotion}
        className={`a11y-btn ${settings.reducedMotion ? 'active' : ''}`}
        aria-pressed={settings.reducedMotion}
        aria-label="Reducir movimiento"
        title="Alternar animaciones"
      >
        <span className="a11y-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h20"></path>
            <path d="M2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6"></path>
            <path d="M12 2v10"></path>
          </svg>
        </span>
        <span className="a11y-label">Movimiento</span>
      </button>
    </div>
  );
}
