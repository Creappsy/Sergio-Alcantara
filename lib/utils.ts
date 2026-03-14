import { config, ALLOWED_TYPES, DANGEROUS_EXTENSIONS, UPLOAD_API_URL, SUBMIT_API_URL } from './config';
import type { UploadedFile } from './types';

// ═══════════════════════════════════════════════════════════════
// 🔒  SECURITY CONSTANTS
// ═══════════════════════════════════════════════════════════════

const MAX_INPUT_LENGTH = 10000;
const MAX_EMAIL_LENGTH = 254;
const MAX_URL_LENGTH = 2048;
const CSRF_TOKEN_LENGTH = 32;

// Patrones peligrosos
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:\s*text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
  /@import/gi,
  /url\s*\(/gi,
  /eval\s*\(/gi,
  /document\./gi,
  /window\./gi,
];

// Patrones de spam
const SPAM_PATTERNS = [
  /\[url=/i,
  /\[link=/i,
  /<a\s+href=/i,
  /viagra|cialis|casino|poker|lottery|winner/i,
  /click\s*here\s*now/i,
  /free\s*money/i,
  /act\s*now/i,
  /limited\s*time\s*offer/i,
];

// ═══════════════════════════════════════════════════════════════
// 🛡️  SECURITY UTILITIES
// ═══════════════════════════════════════════════════════════════

export function sanitizeInput(str: string): string {
  if (typeof str !== 'string') return '';
  
  let sanitized = str.substring(0, MAX_INPUT_LENGTH);
  
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  return sanitized.trim();
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function detectSpam(str: string): { isSpam: boolean; reason?: string } {
  const lowerStr = str.toLowerCase();
  
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(lowerStr)) {
      return { isSpam: true, reason: 'Contenido sospechoso detectado' };
    }
  }
  
  const urlCount = (str.match(/https?:\/\//g) || []).length;
  if (urlCount > 5) {
    return { isSpam: true, reason: 'Demasiados enlaces' };
  }
  
  const words = str.split(/\s+/);
  const wordCounts: Record<string, number> = {};
  for (const word of words) {
    const lower = word.toLowerCase();
    wordCounts[lower] = (wordCounts[lower] || 0) + 1;
    if (wordCounts[lower] > 10 && word.length > 3) {
      return { isSpam: true, reason: 'Repetición excesiva detectada' };
    }
  }
  
  return { isSpam: false };
}

export function generateCSRFToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ═══════════════════════════════════════════════════════════════
// ✅  VALIDATION
// ═══════════════════════════════════════════════════════════════

export function validateFileType(file: File): boolean {
  if (!file || !file.type) return false;
  const hasAllowedType = ALLOWED_TYPES.includes(file.type);
  const hasDangerousExt = DANGEROUS_EXTENSIONS.some((ext: string) =>
    file.name.toLowerCase().endsWith(ext)
  );
  return hasAllowedType && !hasDangerousExt;
}

export function validateFileSize(file: File): boolean {
  return file && file.size > 0 && file.size <= config.maxFileSize;
}

export function validateFileName(filename: string): boolean {
  if (!filename || typeof filename !== 'string') return false;
  const safeName = filename.replace(/[^\w.\-]/g, '_');
  return safeName.length > 0 && safeName.length < 255;
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email requerido' };
  }
  
  if (email.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: 'Email muy largo' };
  }
  
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Formato de email inválido' };
  }
  
  const suspiciousDomains = ['tempmail', 'guerrillamail', '10minutemail', 'throwaway'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && suspiciousDomains.some(d => domain.includes(d))) {
    return { valid: false, error: 'Dominio de email temporal no permitido' };
  }
  
  return { valid: true };
}

export function validateURL(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') return { valid: true };
  
  if (url.length > MAX_URL_LENGTH) {
    return { valid: false, error: 'URL muy larga' };
  }
  
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Solo se permiten URLs HTTP/HTTPS' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'URL inválida' };
  }
}

export function validateHexColor(color: string): boolean {
  if (!color) return true;
  return /^#[0-9A-Fa-f]{6}$/.test(color) || /^#[0-9A-Fa-f]{3}$/.test(color);
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true;
  const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
  return phoneRegex.test(phone);
}

export function validateRequired(value: string): { valid: boolean; error?: string } {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'Campo requerido' };
  }
  if (value.trim().length === 0) {
    return { valid: false, error: 'Campo requerido' };
  }
  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════
// 📤  UPLOAD FILES (via API route)
// ═══════════════════════════════════════════════════════════════

export async function uploadFiles(
  files: File[],
  folder: string,
  onProgress?: (fileName: string) => void
): Promise<UploadedFile[]> {
  const uploadedFiles: UploadedFile[] = [];

  for (const file of files) {
    try {
      if (!validateFileType(file)) {
        throw new Error('Tipo de archivo no permitido');
      }
      if (!validateFileSize(file)) {
        throw new Error('Archivo muy grande (máx. 10MB)');
      }

      onProgress?.(file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      
      const res = await fetch(UPLOAD_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al subir archivo');
      }

      const data = await res.json();
      
      uploadedFiles.push({
        name: data.name || file.name,
        url: data.url,
        type: data.type || file.type,
        size: data.size || file.size,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Upload error:', message);
    }
  }

  return uploadedFiles;
}

// ═══════════════════════════════════════════════════════════════
// 📤  FORM SUBMISSION
// ═══════════════════════════════════════════════════════════════

export async function submitForm(
  data: Record<string, unknown>,
  fileUrls: Record<string, UploadedFile[]>
): Promise<{ success: boolean; message: string; submissionId?: string }> {
  const WEB3FORMS_KEY = config.web3formsKey;
  const EMAIL_DESTINO = config.emailDestino;
  
  if (!WEB3FORMS_KEY || !EMAIL_DESTINO) {
    return { 
      success: false, 
      message: 'Error: WEB3FORMS_KEY o EMAIL_DESTINO no configurados' 
    };
  }
  
  // Crear FormData para Web3Forms (envío directo desde cliente)
  const formData = new FormData();
  formData.append('access_key', WEB3FORMS_KEY);
  formData.append('subject', `[Creappsy] Nueva solicitud de ${(data.brandName as string) || 'Artista'}`);
  formData.append('from_name', (data.brandName as string) || 'Artista');
  formData.append('email', (data.pressEmail as string) || '');
  formData.append('to', EMAIL_DESTINO);
  formData.append('botcheck', '');
  
  // Construir mensaje con toda la información
  const messageContent = [
    `Nombre Artístico: ${(data.brandName as string) || '-'}`,
    `Manager/PR: ${(data.pressName as string) || '-'}`,
    `Email de Contacto: ${(data.pressEmail as string) || '-'}`,
    `Teléfono: ${(data.pressPhone as string) || '-'}`,
    `Dominio Deseado: ${(data.domain as string) || '-'}`,
    `Bio Corta: ${((data.bioShort as string) || '-').substring(0, 500)}`,
    '',
    '--- Redes Sociales ---',
    (data.socialLinks as Array<{platform: string, url: string}>)?.map(s => `${s.platform}: ${s.url}`).join('\n') || 'Ninguna',
    '',
    '--- Archivos Subidos ---',
    Object.keys(fileUrls).length > 0 
      ? Object.entries(fileUrls).map(([field, files]) => {
          const urls = files.map(f => f.url).join('\n  ');
          return `${field}:\n  ${urls}`;
        }).join('\n\n')
      : 'Sin archivos',
    '',
    '--- Datos Completos ---',
    JSON.stringify(data, null, 2),
  ].join('\n');
  
  formData.append('message', messageContent);

  try {
    // Enviar directamente a Web3Forms desde el cliente (evita Cloudflare)
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    const resData = await res.json();

    if (res.ok && resData.success) {
      return { 
        success: true, 
        message: 'Enviado correctamente',
        submissionId: resData.submissionId || `sub_${Date.now().toString(36)}`,
      };
    } else {
      return {
        success: false,
        message: resData.message || 'Error al enviar a Web3Forms',
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error de conexión';
    return { success: false, message };
  }
}

// ═══════════════════════════════════════════════════════════════
// 📊  RATE LIMITING
// ═══════════════════════════════════════════════════════════════

const rateLimitStore = new Map<string, { count: number; firstAttempt: number; blocked: boolean; blockedUntil?: number }>();

export function checkRateLimit(): {
  allowed: boolean;
  waitTime?: number;
  message?: string;
  remaining?: number;
} {
  const key = 'default';
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (entry?.blocked && entry.blockedUntil && now < entry.blockedUntil) {
    const remaining = Math.ceil((entry.blockedUntil - now) / 1000);
    return {
      allowed: false,
      waitTime: remaining,
      message: `Bloqueado por demasiados intentos. Espera ${remaining} segundos.`,
    };
  }

  if (!entry) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now, blocked: false });
    return { allowed: true, remaining: config.maxSubmissions - 1 };
  }

  const timeSinceFirst = now - entry.firstAttempt;
  
  if (timeSinceFirst > config.rateLimitMs) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now, blocked: false });
    return { allowed: true, remaining: config.maxSubmissions - 1 };
  }

  entry.count++;

  if (entry.count >= config.maxSubmissions) {
    const blockUntil = entry.firstAttempt + config.rateLimitMs;
    entry.blocked = true;
    entry.blockedUntil = blockUntil;
    return {
      allowed: false,
      message: `Límite de ${config.maxSubmissions} intentos alcanzado.`,
    };
  }

  return { 
    allowed: true, 
    remaining: config.maxSubmissions - entry.count,
  };
}

export function recordSubmission(): void {
  const key = 'default';
  const entry = rateLimitStore.get(key);
  if (entry) {
    entry.count = 0;
    entry.firstAttempt = Date.now();
    entry.blocked = false;
    entry.blockedUntil = undefined;
  }
}

// ═══════════════════════════════════════════════════════════════
// 🔧  UTILITIES
// ═══════════════════════════════════════════════════════════════

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function generateFileName(brandName: string): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  const artistName = (brandName || 'artista')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 20);
  return `creappsy_${artistName}_${dateStr}.json`;
}

export function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}