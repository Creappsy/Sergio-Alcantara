import type { AppConfig } from './types';

export const config: AppConfig = {
  submitMode: 'web3forms',
  web3formsKey: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '',
  formspreeId: 'YOUR_FORM_ID',
  b2KeyId: '',
  b2ApplicationKey: '',
  b2BucketName: process.env.NEXT_PUBLIC_B2_BUCKET_NAME || '',
  gofileToken: '',
  gofileFolderId: '',
  emailDestino: process.env.NEXT_PUBLIC_EMAIL_DESTINO || 'info@creappsy.com',
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 100 * 1024 * 1024,
  rateLimitMs: parseInt(process.env.NEXT_PUBLIC_BLOCK_DURATION_MS || '900000'),
  maxSubmissions: parseInt(process.env.NEXT_PUBLIC_MAX_ATTEMPTS || '5'),
};

export const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml',
  'application/pdf', 'application/zip', 'application/postscript',
  'application/illustrator', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.php', '.asp', '.aspx', '.jsp', '.js', '.html', '.htm',
];

// Endpoint de API para subir archivos
export const UPLOAD_API_URL = '/api/upload';

// Endpoint de API para enviar formulario
export const SUBMIT_API_URL = '/api/submit';